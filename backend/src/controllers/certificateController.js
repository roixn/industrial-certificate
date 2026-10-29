import { Certificate } from '../models/Certificate.js';
import { CompanySettings } from '../models/CompanySettings.js';
import { AuditLog } from '../models/AuditLog.js';
import { validateTrainingDuration, generateUniqueCertificateId } from '../services/certService.js';
import { generateCertificatePdf } from '../services/pdfService.js';

/**
 * Create a new Certificate (Draft or Issued directly)
 * POST /api/certificates
 */
export async function createCertificate(req, res, next) {
  try {
    const {
      traineeName,
      fatherName,
      institution,
      degree,
      branch,
      enrollmentNumber,
      trainingDomain,
      trainingStartDate,
      trainingEndDate,
      trainingMode,
      performanceGrade,
      remarks,
      issueImmediately,
    } = req.body;

    const settings = await CompanySettings.getSettings();

    // Validate 45 Days Duration rule
    const durationValidation = validateTrainingDuration(
      trainingStartDate,
      trainingEndDate,
      settings.countingPolicy || 'INCLUSIVE'
    );

    if (!durationValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: durationValidation.error,
        calculatedDays: durationValidation.calculatedDays,
      });
    }

    // Generate unique Certificate ID on the server
    const certificateId = await generateUniqueCertificateId(settings.certificatePrefix);

    // Build public verification URL
    const baseUrl = settings.verificationDomain.replace(/\/+$/, '');
    const qrVerificationUrl = `${baseUrl}/${certificateId}`;

    // Company Snapshot
    const companySnapshot = {
      name: settings.companyName,
      tagline: settings.companyTagline,
      address: settings.address,
      email: settings.email,
      phone: settings.phone,
      website: settings.website,
      logo: settings.companyLogo || '',
    };

    const isIssued = Boolean(issueImmediately);
    const now = new Date();

    const certificate = new Certificate({
      certificateId,
      traineeName: traineeName.trim(),
      fatherName: fatherName ? fatherName.trim() : '',
      institution: institution.trim(),
      degree: degree.trim(),
      branch: branch.trim(),
      enrollmentNumber: enrollmentNumber ? enrollmentNumber.trim() : '',
      trainingDomain: trainingDomain.trim(),
      trainingStartDate: new Date(trainingStartDate),
      trainingEndDate: new Date(trainingEndDate),
      durationDays: 45,
      trainingMode: trainingMode || 'Hybrid',
      performanceGrade: performanceGrade || 'Distinction (A+)',
      remarks: remarks || '',
      issueDate: now,
      status: isIssued ? 'ISSUED' : 'DRAFT',
      signatoryName: settings.authorizedSignatory,
      signatoryDesignation: settings.signatoryDesignation,
      companySnapshot,
      qrVerificationUrl,
      createdBy: req.admin._id,
      ...(isIssued && {
        issuedAt: now,
        issuedBy: req.admin._id,
      }),
    });

    await certificate.save();

    // Audit Log
    await AuditLog.create({
      action: isIssued ? 'CERTIFICATE_ISSUED_DIRECT' : 'CERTIFICATE_CREATED_DRAFT',
      certificateId: certificate.certificateId,
      performedBy: { id: req.admin._id, name: req.admin.name, email: req.admin.email },
      reason: `Certificate created for trainee ${traineeName} in domain ${trainingDomain}`,
      details: {
        certificateId: certificate.certificateId,
        status: certificate.status,
        durationDays: 45,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(201).json({
      success: true,
      message: isIssued ? 'Certificate generated and issued successfully.' : 'Draft certificate created successfully.',
      data: certificate,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * List Certificates with Search, Filter & Pagination
 * GET /api/certificates
 */
export async function getCertificates(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const { search, status, domain, startDate, endDate } = req.query;
    const filter = {};

    if (status && ['DRAFT', 'ISSUED', 'REVOKED'].includes(status)) {
      filter.status = status;
    }

    if (domain) {
      filter.trainingDomain = new RegExp(domain.trim(), 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { traineeName: searchRegex },
        { certificateId: searchRegex },
        { institution: searchRegex },
        { enrollmentNumber: searchRegex },
      ];
    }

    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }

    const [certificates, total] = await Promise.all([
      Certificate.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('issuedBy', 'name email')
        .populate('revokedBy', 'name email')
        .lean(),
      Certificate.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: certificates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Single Certificate by certificateId or MongoDB ID
 * GET /api/certificates/:certificateId
 */
export async function getCertificateById(req, res, next) {
  try {
    const { certificateId } = req.params;
    const query = certificateId.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: certificateId }
      : { certificateId: certificateId.toUpperCase() };

    const certificate = await Certificate.findOne(query)
      .populate('createdBy', 'name email')
      .populate('issuedBy', 'name email')
      .populate('revokedBy', 'name email')
      .populate('amendmentHistory.amendedBy', 'name email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update / Amend a Certificate
 * PATCH /api/certificates/:certificateId
 */
export async function updateCertificate(req, res, next) {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId: certificateId.toUpperCase() });

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (cert.status === 'REVOKED') {
      return res.status(400).json({
        success: false,
        message: 'Revoked certificates are permanently locked and cannot be edited or modified.',
      });
    }

    const {
      traineeName,
      fatherName,
      institution,
      degree,
      branch,
      enrollmentNumber,
      trainingDomain,
      trainingStartDate,
      trainingEndDate,
      trainingMode,
      performanceGrade,
      remarks,
      amendmentReason,
    } = req.body;

    const settings = await CompanySettings.getSettings();

    // If dates are being changed, validate 45-day rule
    const newStart = trainingStartDate || cert.trainingStartDate;
    const newEnd = trainingEndDate || cert.trainingEndDate;
    if (trainingStartDate || trainingEndDate) {
      const durationValidation = validateTrainingDuration(
        newStart,
        newEnd,
        settings.countingPolicy || 'INCLUSIVE'
      );
      if (!durationValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: durationValidation.error,
          calculatedDays: durationValidation.calculatedDays,
        });
      }
    }

    // If certificate is already ISSUED, an amendment reason is strictly required
    if (cert.status === 'ISSUED') {
      if (!amendmentReason || amendmentReason.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'An amendment reason (at least 5 characters) is required when modifying an already issued certificate.',
        });
      }

      // Record snapshot of previous data in amendment history
      cert.amendmentHistory.push({
        amendedAt: new Date(),
        amendedBy: req.admin._id,
        reason: amendmentReason.trim(),
        previousData: {
          traineeName: cert.traineeName,
          institution: cert.institution,
          degree: cert.degree,
          branch: cert.branch,
          trainingDomain: cert.trainingDomain,
          trainingStartDate: cert.trainingStartDate,
          trainingEndDate: cert.trainingEndDate,
          trainingMode: cert.trainingMode,
          performanceGrade: cert.performanceGrade,
        },
      });
    }

    if (traineeName !== undefined) cert.traineeName = traineeName.trim();
    if (fatherName !== undefined) cert.fatherName = fatherName.trim();
    if (institution !== undefined) cert.institution = institution.trim();
    if (degree !== undefined) cert.degree = degree.trim();
    if (branch !== undefined) cert.branch = branch.trim();
    if (enrollmentNumber !== undefined) cert.enrollmentNumber = enrollmentNumber.trim();
    if (trainingDomain !== undefined) cert.trainingDomain = trainingDomain.trim();
    if (trainingStartDate !== undefined) cert.trainingStartDate = new Date(trainingStartDate);
    if (trainingEndDate !== undefined) cert.trainingEndDate = new Date(trainingEndDate);
    if (trainingMode !== undefined) cert.trainingMode = trainingMode;
    if (performanceGrade !== undefined) cert.performanceGrade = performanceGrade;
    if (remarks !== undefined) cert.remarks = remarks;

    await cert.save();

    await AuditLog.create({
      action: cert.status === 'ISSUED' ? 'CERTIFICATE_AMENDED' : 'CERTIFICATE_DRAFT_UPDATED',
      certificateId: cert.certificateId,
      performedBy: { id: req.admin._id, name: req.admin.name, email: req.admin.email },
      reason: amendmentReason || 'Draft certificate details updated',
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      message: 'Certificate updated successfully.',
      data: cert,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Issue a Draft Certificate
 * POST /api/certificates/:certificateId/issue
 */
export async function issueCertificate(req, res, next) {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId: certificateId.toUpperCase() });

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (cert.status === 'ISSUED') {
      return res.status(400).json({ success: false, message: 'Certificate is already officially issued.' });
    }

    if (cert.status === 'REVOKED') {
      return res.status(400).json({
        success: false,
        message: 'A revoked certificate cannot be directly reissued without creating a new record.',
      });
    }

    const now = new Date();
    cert.status = 'ISSUED';
    cert.issueDate = now;
    cert.issuedAt = now;
    cert.issuedBy = req.admin._id;

    await cert.save();

    await AuditLog.create({
      action: 'CERTIFICATE_ISSUED',
      certificateId: cert.certificateId,
      performedBy: { id: req.admin._id, name: req.admin.name, email: req.admin.email },
      reason: `Certificate officially issued for ${cert.traineeName}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      message: `Certificate ${cert.certificateId} has been successfully issued.`,
      data: cert,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Revoke an Issued Certificate
 * POST /api/certificates/:certificateId/revoke
 */
export async function revokeCertificate(req, res, next) {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory reason (minimum 5 characters) must be provided to revoke a certificate.',
      });
    }

    const cert = await Certificate.findOne({ certificateId: certificateId.toUpperCase() });

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (cert.status === 'REVOKED') {
      return res.status(400).json({ success: false, message: 'Certificate is already revoked.' });
    }

    const now = new Date();
    cert.status = 'REVOKED';
    cert.revokedAt = now;
    cert.revokedBy = req.admin._id;
    cert.revocationReason = reason.trim();

    await cert.save();

    await AuditLog.create({
      action: 'CERTIFICATE_REVOKED',
      certificateId: cert.certificateId,
      performedBy: { id: req.admin._id, name: req.admin.name, email: req.admin.email },
      reason: `Certificate revoked: ${reason.trim()}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      message: `Certificate ${cert.certificateId} has been revoked.`,
      data: cert,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Download Certificate PDF
 * GET /api/certificates/:certificateId/pdf
 */
export async function downloadCertificatePdf(req, res, next) {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId: certificateId.toUpperCase() });

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const pdfBuffer = await generateCertificatePdf(cert);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate_${cert.certificateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

/**
 * Get Comprehensive Dashboard Statistics
 * GET /api/certificates/stats
 */
export async function getStats(req, res, next) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCertificates,
      issuedThisMonth,
      activeCertificates,
      revokedCertificates,
      draftCertificates,
      domainsList,
      recentCertificates,
      recentAuditLogs,
    ] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({
        status: 'ISSUED',
        issuedAt: { $gte: startOfMonth },
      }),
      Certificate.countDocuments({ status: 'ISSUED' }),
      Certificate.countDocuments({ status: 'REVOKED' }),
      Certificate.countDocuments({ status: 'DRAFT' }),
      Certificate.distinct('trainingDomain'),
      Certificate.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('certificateId traineeName trainingDomain status issueDate createdAt')
        .lean(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    // Domain breakdown counts
    const domainCounts = await Certificate.aggregate([
      { $group: { _id: '$trainingDomain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalCertificates,
        issuedThisMonth,
        activeCertificates,
        revokedCertificates,
        draftCertificates,
        totalDomains: domainsList.length,
        domainCounts,
        recentCertificates,
        recentAuditLogs,
      },
    });
  } catch (err) {
    next(err);
  }
}
