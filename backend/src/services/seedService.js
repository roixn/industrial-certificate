import { Admin } from '../models/Admin.js';
import { CompanySettings } from '../models/CompanySettings.js';
import { Certificate } from '../models/Certificate.js';
import { AuditLog } from '../models/AuditLog.js';

let isSeeding = false;

/**
 * Ensures that initial admin, company branding, and baseline demo certificates
 * exist in the database upon fresh connection (especially useful for cloud/Vercel deployments).
 */
export async function ensureInitialSeed() {
  if (isSeeding) return;
  isSeeding = true;

  try {
    // 1. Ensure Superadmin Exists
    const adminCount = await Admin.countDocuments();
    let superAdmin = null;

    const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@nexora-tech.com').toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@Pass2026!';
    const defaultName = process.env.ADMIN_NAME || 'Dr. Rajesh K. Sharma';

    if (adminCount === 0) {
      superAdmin = await Admin.create({
        name: defaultName,
        email: defaultEmail,
        password: defaultPassword,
        role: 'superadmin',
        isActive: true,
      });
      console.log(`[Seed Service] Auto-initialized Superadmin: ${defaultEmail}`);
    } else {
      superAdmin = await Admin.findOne({ role: 'superadmin' }) || await Admin.findOne();
    }

    // 2. Ensure Company Settings Exist
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'Nexora Innovations Pvt. Ltd.',
        companyTagline: 'Center for Advanced Industrial Training & Engineering Excellence',
        address: 'Tower B, 4th Floor, Logix Cyber Park, Sector 62, Electronic City, Noida, Uttar Pradesh 201309',
        email: 'certifications@nexora-tech.com',
        phone: '+91 (080) 4567-8900',
        website: 'https://nexora-innovations.com',
        authorizedSignatory: 'Dr. Rajesh K. Sharma',
        signatoryDesignation: 'Director of Technical Training & Development',
        certificatePrefix: 'CERT',
        verificationDomain: process.env.PUBLIC_VERIFY_BASE_URL || 'https://yields-dragon-boulevard-handed.trycloudflare.com/credentials',
        allowPublicDownload: true,
        countingPolicy: 'INCLUSIVE',
      });
      console.log('[Seed Service] Auto-initialized Company Branding & Settings');
    }

    // 3. Ensure Baseline Demo Certificates Exist if Empty
    const certCount = await Certificate.countDocuments();
    if (certCount === 0) {
      console.log('[Seed Service] Populating baseline demo certificates...');
      const adminId = superAdmin ? superAdmin._id : null;

      const companySnapshot = {
        name: settings.companyName,
        tagline: settings.companyTagline,
        address: settings.address,
        email: settings.email,
        phone: settings.phone,
        website: settings.website,
        logo: settings.companyLogo || '',
      };

      const startDate1 = new Date('2026-06-01T00:00:00.000Z');
      const endDate1 = new Date('2026-07-15T00:00:00.000Z'); // 45 days inclusive

      const startDate2 = new Date('2026-07-01T00:00:00.000Z');
      const endDate2 = new Date('2026-08-14T00:00:00.000Z'); // 45 days inclusive

      const startDateImran = new Date('2026-04-25T00:00:00.000Z');
      const endDateImran = new Date('2026-06-08T00:00:00.000Z'); // 45 days inclusive

      const baseDemoCerts = [
        {
          certificateId: 'CERT-2026-0001',
          traineeName: 'Aarav Patel',
          fatherName: 'Vikram Patel',
          institution: 'National Institute of Technology, Karnataka (NITK)',
          degree: 'Bachelor of Technology',
          branch: 'Computer Science and Engineering',
          enrollmentNumber: 'NITK2023CS1042',
          trainingDomain: 'Full Stack Cloud Native Web Architecture',
          trainingStartDate: startDate1,
          trainingEndDate: endDate1,
          durationDays: 45,
          trainingMode: 'Hybrid',
          performanceGrade: 'Distinction (A+)',
          remarks: 'Demonstrated exceptional competence in modern microservices and high-concurrency systems.',
          issueDate: new Date('2026-07-16T10:00:00.000Z'),
          status: 'ISSUED',
          signatoryName: settings.authorizedSignatory,
          signatoryDesignation: settings.signatoryDesignation,
          companySnapshot,
          qrVerificationUrl: `${settings.verificationDomain.replace(/\/+$/, '')}/CERT-2026-0001`,
          createdBy: adminId,
          issuedAt: new Date('2026-07-16T10:00:00.000Z'),
          issuedBy: adminId,
        },
        {
          certificateId: 'CERT-2026-0002',
          traineeName: 'Priya Sundaram',
          fatherName: 'K. Sundaram',
          institution: 'Vellore Institute of Technology (VIT)',
          degree: 'Master of Science',
          branch: 'Artificial Intelligence & Machine Learning',
          enrollmentNumber: 'VIT22MSAI0048',
          trainingDomain: 'Applied Generative AI & Deep Learning Systems',
          trainingStartDate: startDate2,
          trainingEndDate: endDate2,
          durationDays: 45,
          trainingMode: 'Online',
          performanceGrade: 'Grade A (Outstanding)',
          remarks: 'Developed production-grade LLM retrieval augmentation framework.',
          issueDate: new Date('2026-08-15T11:30:00.000Z'),
          status: 'ISSUED',
          signatoryName: settings.authorizedSignatory,
          signatoryDesignation: settings.signatoryDesignation,
          companySnapshot,
          qrVerificationUrl: `${settings.verificationDomain.replace(/\/+$/, '')}/CERT-2026-0002`,
          createdBy: adminId,
          issuedAt: new Date('2026-08-15T11:30:00.000Z'),
          issuedBy: adminId,
        },
        {
          certificateId: 'CERT-2026-0003',
          traineeName: 'Rohan Mehra',
          fatherName: 'Sanjay Mehra',
          institution: 'Delhi Technological University (DTU)',
          degree: 'Bachelor of Technology',
          branch: 'Information Technology',
          enrollmentNumber: 'DTU21IT051',
          trainingDomain: 'DevOps & Kubernetes Infrastructure Engineering',
          trainingStartDate: startDate1,
          trainingEndDate: endDate1,
          durationDays: 45,
          trainingMode: 'Offline',
          performanceGrade: 'Incomplete',
          remarks: 'Revoked due to disciplinary review.',
          issueDate: new Date('2026-07-16T10:00:00.000Z'),
          status: 'REVOKED',
          signatoryName: settings.authorizedSignatory,
          signatoryDesignation: settings.signatoryDesignation,
          companySnapshot,
          qrVerificationUrl: `${settings.verificationDomain.replace(/\/+$/, '')}/CERT-2026-0003`,
          createdBy: adminId,
          issuedAt: new Date('2026-07-16T10:00:00.000Z'),
          issuedBy: adminId,
          revokedAt: new Date('2026-08-01T14:20:00.000Z'),
          revokedBy: adminId,
          revocationReason: 'Academic integrity violation: Unauthorized duplicate submission of capstone project repository.',
        },
        {
          certificateId: 'CERT-2026-0004',
          traineeName: 'Ananya Sharma',
          fatherName: 'Dinesh Sharma',
          institution: 'BITS Pilani',
          degree: 'Bachelor of Engineering',
          branch: 'Electronics and Communications',
          enrollmentNumber: 'BITS2023EC789',
          trainingDomain: 'Embedded IoT & Edge AI Firmware Development',
          trainingStartDate: startDate2,
          trainingEndDate: endDate2,
          durationDays: 45,
          trainingMode: 'Hybrid',
          performanceGrade: 'Distinction (A+)',
          remarks: 'Draft pending final supervisor assessment sign-off.',
          issueDate: new Date(),
          status: 'DRAFT',
          signatoryName: settings.authorizedSignatory,
          signatoryDesignation: settings.signatoryDesignation,
          companySnapshot,
          qrVerificationUrl: `${settings.verificationDomain.replace(/\/+$/, '')}/CERT-2026-0004`,
          createdBy: adminId,
        },
        {
          certificateId: 'CERT-2026-0005',
          traineeName: 'Imran Ali',
          fatherName: 'Mustafa Ali',
          institution: 'PCD Global Tech Solutions',
          degree: 'Professional Diploma',
          branch: 'Computer Science & Python Development',
          enrollmentNumber: 'PCD-PY-2026-88',
          trainingDomain: '45 Days of Python programming with DSA',
          trainingStartDate: startDateImran,
          trainingEndDate: endDateImran,
          durationDays: 45,
          trainingMode: 'Hybrid',
          performanceGrade: 'Distinction (A+)',
          remarks: 'Successfully built real-world enterprise algorithms and full-stack backend systems.',
          issueDate: new Date('2026-10-29T14:20:13.233Z'),
          status: 'ISSUED',
          signatoryName: settings.authorizedSignatory,
          signatoryDesignation: settings.signatoryDesignation,
          companySnapshot,
          qrVerificationUrl: `${settings.verificationDomain.replace(/\/+$/, '')}/f3e7b730-f86d-49ba-b5d0-19e0cbc3d103`,
          createdBy: adminId,
          issuedAt: new Date('2026-10-29T14:20:13.233Z'),
          issuedBy: adminId,
        },
      ];

      await Certificate.insertMany(baseDemoCerts);
      console.log('[Seed Service] Successfully initialized baseline certificates (including Imran Ali Credsverse record).');
    }
  } catch (err) {
    console.warn('[Seed Service] Error during ensureInitialSeed:', err.message);
  } finally {
    isSeeding = false;
  }
}
