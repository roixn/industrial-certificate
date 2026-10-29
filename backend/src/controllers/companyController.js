import { CompanySettings } from '../models/CompanySettings.js';
import { AuditLog } from '../models/AuditLog.js';

export async function getCompanySettings(req, res, next) {
  try {
    const settings = await CompanySettings.getSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCompanySettings(req, res, next) {
  try {
    let settings = await CompanySettings.getSettings();
    const prevSnapshot = settings.toObject();

    Object.assign(settings, req.body);
    await settings.save();

    await AuditLog.create({
      action: 'COMPANY_SETTINGS_UPDATED',
      performedBy: { id: req.admin._id, name: req.admin.name, email: req.admin.email },
      reason: 'Company configuration and branding details updated',
      details: { changes: req.body, previous: prevSnapshot },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      message: 'Company settings updated successfully',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
}
