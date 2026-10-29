import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { OtpVerification } from '../models/OtpVerification.js';
import { AuditLog } from '../models/AuditLog.js';
import { config } from '../config/config.js';
import { sendOtpEmail } from '../services/emailService.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative email or password.',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This administrative account has been deactivated. Contact Superadmin.',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative email or password.',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Sign JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Set secure HTTP-only cookie
    const isProduction = config.nodeEnv === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Audit log
    await AuditLog.create({
      action: 'ADMIN_LOGIN',
      performedBy: { id: admin._id, name: admin.name, email: admin.email },
      reason: 'Administrator logged in successfully',
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.admin) {
      await AuditLog.create({
        action: 'ADMIN_LOGOUT',
        performedBy: { id: req.admin._id, name: req.admin.name, email: req.admin.email },
        reason: 'Administrator logged out',
        ipAddress: req.ip,
      });
    }

    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Successfully logged out.',
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        lastLogin: req.admin.lastLogin,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Step 1: Request OTP for Administrator Registration
 * POST /api/auth/request-otp
 */
export async function requestAdminOtp(req, res, next) {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name and official email address are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if account already exists
    const existingAdmin = await Admin.findOne({ email: cleanEmail });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An administrator account with this email address already exists. Please log in directly.',
      });
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP record
    await OtpVerification.deleteMany({ email: cleanEmail });
    await OtpVerification.create({
      email: cleanEmail,
      name: name.trim(),
      otp,
      expiresAt,
    });

    console.log(`\n======================================================`);
    console.log(`[AUTH] 6-Digit Verification OTP Generated for Admin Registration:`);
    console.log(`       Target Email: ${cleanEmail}`);
    console.log(`       OTP Code:     ${otp}`);
    console.log(`       Valid For:    10 minutes`);
    console.log(`======================================================\n`);

    // Dispatch real email if SMTP credentials are provided
    const emailResult = await sendOtpEmail({
      to: cleanEmail,
      name: name.trim(),
      otp,
    });

    if (emailResult.sent) {
      return res.status(200).json({
        success: true,
        sentToEmail: true,
        message: `A 6-digit verification code has been dispatched directly to ${cleanEmail}. Please check your inbox (and spam/junk folder).`,
        expiresInMinutes: 10,
      });
    }

    return res.status(200).json({
      success: true,
      sentToEmail: false,
      message: `A 6-digit verification OTP was generated for ${cleanEmail}. (SMTP not configured in backend/.env; code displayed below for demo testing).`,
      previewOtp: otp,
      expiresInMinutes: 10,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Step 2: Verify OTP & Activate Admin Account
 * POST /api/auth/verify-otp-register
 */
export async function verifyOtpAndRegister(req, res, next) {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, 6-digit OTP, and a secure password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    // Find valid OTP record
    const otpRecord = await OtpVerification.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new verification code.',
      });
    }

    // Create the active Admin account
    const admin = new Admin({
      name: otpRecord.name,
      email: cleanEmail,
      password,
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    });

    await admin.save();

    // Delete used OTP
    await OtpVerification.deleteMany({ email: cleanEmail });

    // Sign JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const isProduction = config.nodeEnv === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await AuditLog.create({
      action: 'ADMIN_REGISTERED_WITH_OTP',
      performedBy: { id: admin._id, name: admin.name, email: admin.email },
      reason: 'Administrator account verified and activated via 6-digit OTP',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(201).json({
      success: true,
      message: 'Account successfully verified and activated! Welcome to the administrator panel.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Superadmin: Get All Administrators
 * GET /api/auth/admins
 */
export async function getAdminsList(req, res, next) {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Superadmin: Toggle Admin Active Status
 * PATCH /api/auth/admins/:id/toggle-status
 */
export async function toggleAdminStatus(req, res, next) {
  try {
    const { id } = req.params;
    if (String(req.admin._id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.',
      });
    }

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return res.status(404).json({ success: false, message: 'Administrator not found' });
    }

    targetAdmin.isActive = !targetAdmin.isActive;
    await targetAdmin.save();

    await AuditLog.create({
      action: targetAdmin.isActive ? 'ADMIN_ACTIVATED' : 'ADMIN_DEACTIVATED',
      performedBy: { id: req.admin._id, name: req.admin.name, email: req.admin.email },
      reason: `Superadmin ${targetAdmin.isActive ? 'activated' : 'deactivated'} administrator ${targetAdmin.email}`,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Administrator ${targetAdmin.email} has been ${targetAdmin.isActive ? 'activated' : 'deactivated'}.`,
      data: targetAdmin,
    });
  } catch (err) {
    next(err);
  }
}
