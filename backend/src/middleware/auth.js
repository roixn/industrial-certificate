import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { Admin } from '../models/Admin.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // Check cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.',
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const admin = await Admin.findById(decoded.id).select('+password');

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or access has been deactivated.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this administrative operation.',
      });
    }
    next();
  };
}
