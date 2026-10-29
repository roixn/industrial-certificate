import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { CompanySettings } from '../models/CompanySettings.js';
import { Certificate } from '../models/Certificate.js';
import { AuditLog } from '../models/AuditLog.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedDemoData() {
  try {
    console.log('[Seed Demo] Initializing database connection...');
    await connectDB();

    // 1. Create or retrieve Admin
    const email = 'admin@nexora-tech.com';
    let admin = await Admin.findOne({ email });
    if (!admin) {
      admin = await Admin.create({
        name: 'Dr. Rajesh K. Sharma',
        email,
        password: 'Admin@Pass2026!',
        role: 'superadmin',
        isActive: true,
      });
      console.log(`[Seed Demo] Created admin user: ${email} / Admin@Pass2026!`);
    }

    // 2. Setup Company Settings
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
        verificationDomain: 'http://localhost:5173/verify',
        allowPublicDownload: true,
        countingPolicy: 'INCLUSIVE',
      });
      console.log('[Seed Demo] Initialized Company Settings');
    }

    // 3. Clear previous demo certificates to ensure idempotence
    await Certificate.deleteMany({ certificateId: { $in: ['CERT-2026-0001', 'CERT-2026-0002', 'CERT-2026-0003', 'CERT-2026-0004'] } });

    const companySnapshot = {
      name: settings.companyName,
      tagline: settings.companyTagline,
      address: settings.address,
      email: settings.email,
      phone: settings.phone,
      website: settings.website,
      logo: settings.companyLogo || '',
    };

    // Calculate dates exactly spanning 45 days inclusive:
    // Start: June 1, 2026 -> End: July 15, 2026 = 45 days inclusive (June 30 days + July 15 days = 45 days)
    const startDate1 = new Date('2026-06-01T00:00:00.000Z');
    const endDate1 = new Date('2026-07-15T00:00:00.000Z');

    const startDate2 = new Date('2026-07-01T00:00:00.000Z');
    const endDate2 = new Date('2026-08-14T00:00:00.000Z'); // July 31 days (from 1st is 31) + Aug 14 days = 45 days

    const demoCertificates = [
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
        qrVerificationUrl: `http://localhost:5173/verify/CERT-2026-0001`,
        createdBy: admin._id,
        issuedAt: new Date('2026-07-16T10:00:00.000Z'),
        issuedBy: admin._id,
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
        qrVerificationUrl: `http://localhost:5173/verify/CERT-2026-0002`,
        createdBy: admin._id,
        issuedAt: new Date('2026-08-15T11:30:00.000Z'),
        issuedBy: admin._id,
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
        qrVerificationUrl: `http://localhost:5173/verify/CERT-2026-0003`,
        createdBy: admin._id,
        issuedAt: new Date('2026-07-16T10:00:00.000Z'),
        issuedBy: admin._id,
        revokedAt: new Date('2026-08-01T14:20:00.000Z'),
        revokedBy: admin._id,
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
        qrVerificationUrl: `http://localhost:5173/verify/CERT-2026-0004`,
        createdBy: admin._id,
      },
    ];

    await Certificate.insertMany(demoCertificates);
    console.log('[Seed Demo] Inserted 4 demo certificates (Valid, Revoked, Draft)');

    // 4. Create Audit Logs
    await AuditLog.create([
      {
        action: 'CERTIFICATE_ISSUED',
        certificateId: 'CERT-2026-0001',
        performedBy: { id: admin._id, name: admin.name, email: admin.email },
        reason: 'Initial demo issuance for Aarav Patel',
        createdAt: new Date('2026-07-16T10:00:00.000Z'),
      },
      {
        action: 'CERTIFICATE_ISSUED',
        certificateId: 'CERT-2026-0002',
        performedBy: { id: admin._id, name: admin.name, email: admin.email },
        reason: 'Initial demo issuance for Priya Sundaram',
        createdAt: new Date('2026-08-15T11:30:00.000Z'),
      },
      {
        action: 'CERTIFICATE_REVOKED',
        certificateId: 'CERT-2026-0003',
        performedBy: { id: admin._id, name: admin.name, email: admin.email },
        reason: 'Academic integrity violation: Unauthorized duplicate submission of capstone project repository.',
        createdAt: new Date('2026-08-01T14:20:00.000Z'),
      },
    ]);

    console.log('[Seed Demo] Demo audit log entries created.');
    console.log('\n=============================================');
    console.log('DEMO DATA READY:');
    console.log('  Admin User: admin@nexora-tech.com');
    console.log('  Password:   Admin@Pass2026!');
    console.log('  Valid Cert: CERT-2026-0001 (Aarav Patel)');
    console.log('  Valid Cert: CERT-2026-0002 (Priya Sundaram)');
    console.log('  Revoked:    CERT-2026-0003 (Rohan Mehra)');
    console.log('  Draft Cert: CERT-2026-0004 (Ananya Sharma)');
    console.log('=============================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Demo Error]', err);
    process.exit(1);
  }
}

seedDemoData();
