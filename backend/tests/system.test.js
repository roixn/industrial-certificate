import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Admin } from '../src/models/Admin.js';
import { CompanySettings } from '../src/models/CompanySettings.js';
import { Certificate } from '../src/models/Certificate.js';
import { validateTrainingDuration, generateUniqueCertificateId } from '../src/services/certService.js';
import { generateCertificatePdf } from '../src/services/pdfService.js';
import { generateQrBuffer, generateQrDataUrl } from '../src/services/qrService.js';

test('Certificate System Comprehensive Test Suite', async (t) => {
  let adminUser = null;
  let settings = null;

  await t.test('1. Database Connection & Setup', async () => {
    const conn = await connectDB();
    assert.ok(conn, 'Database connection established');

    // Create test admin
    await Admin.deleteMany({ email: 'testadmin@system.test' });
    adminUser = await Admin.create({
      name: 'Test Administrator',
      email: 'testadmin@system.test',
      password: 'SecureTestPassword123!',
      role: 'superadmin',
    });
    assert.ok(adminUser._id, 'Admin created');
    assert.equal(adminUser.role, 'superadmin');

    // Verify password hashing
    const isMatch = await adminUser.comparePassword('SecureTestPassword123!');
    assert.equal(isMatch, true, 'Password hashes and matches');

    const wrongMatch = await adminUser.comparePassword('WrongPassword');
    assert.equal(wrongMatch, false, 'Rejects wrong password');

    // Settings
    settings = await CompanySettings.getSettings();
    assert.ok(settings.companyName, 'Default company settings retrieved');
  });

  await t.test('2. Training Date & 45-Day Duration Validation', () => {
    // 45 days inclusive: June 1, 2026 to July 15, 2026
    const validSpan = validateTrainingDuration('2026-06-01', '2026-07-15', 'INCLUSIVE');
    assert.equal(validSpan.isValid, true, '45 days inclusive is valid');
    assert.equal(validSpan.calculatedDays, 45);

    // Invalid span (less than 45 days: e.g. 30 days)
    const tooShort = validateTrainingDuration('2026-06-01', '2026-06-30', 'INCLUSIVE');
    assert.equal(tooShort.isValid, false, '30 days is rejected');
    assert.equal(tooShort.calculatedDays, 30);

    // Reversed dates (end before start)
    const reversed = validateTrainingDuration('2026-07-15', '2026-06-01', 'INCLUSIVE');
    assert.equal(reversed.isValid, false, 'Reversed dates rejected');
  });

  await t.test('3. Unique Certificate ID Generation & Duplicate Prevention', async () => {
    const certId1 = await generateUniqueCertificateId('TEST');
    assert.match(certId1, /^TEST-\d{4}-\d{4}$/, 'Follows format TEST-YYYY-0001');

    // Mock insert
    const tempCert = await Certificate.create({
      certificateId: certId1,
      traineeName: 'Test Student',
      institution: 'Test College',
      degree: 'B.Tech',
      branch: 'CS',
      trainingDomain: 'Cloud Computing',
      trainingStartDate: new Date('2026-06-01'),
      trainingEndDate: new Date('2026-07-15'),
      durationDays: 45,
      signatoryName: 'Director',
      signatoryDesignation: 'Head',
      companySnapshot: {
        name: 'Test Corp',
        address: 'Test City',
        email: 'test@corp.com',
        phone: '1234567890',
        website: 'https://test.corp',
      },
      qrVerificationUrl: `https://test.corp/verify/${certId1}`,
      createdBy: adminUser._id,
      status: 'DRAFT',
    });

    assert.ok(tempCert, 'Certificate inserted');

    // Attempt duplicate certificateId insert should fail due to unique index
    let duplicateFailed = false;
    try {
      await Certificate.create({
        certificateId: certId1,
        traineeName: 'Another Student',
        institution: 'Another College',
        degree: 'B.Tech',
        branch: 'IT',
        trainingDomain: 'Web Dev',
        trainingStartDate: new Date('2026-06-01'),
        trainingEndDate: new Date('2026-07-15'),
        durationDays: 45,
        signatoryName: 'Director',
        signatoryDesignation: 'Head',
        companySnapshot: {
          name: 'Test Corp',
          address: 'Test City',
          email: 'test@corp.com',
          phone: '1234567890',
          website: 'https://test.corp',
        },
        qrVerificationUrl: `https://test.corp/verify/${certId1}`,
        createdBy: adminUser._id,
        status: 'DRAFT',
      });
    } catch (err) {
      duplicateFailed = true;
      assert.equal(err.code, 11000, 'Duplicate key error 11000 caught');
    }
    assert.equal(duplicateFailed, true, 'Duplicate certificate ID prevented');

    // Next generated certificate should increment sequence
    const certId2 = await generateUniqueCertificateId('TEST');
    assert.notEqual(certId1, certId2, 'Subsequent ID is unique');
  });

  await t.test('4. Certificate Issuance Workflow', async () => {
    const cert = await Certificate.findOne({ certificateId: { $regex: /^TEST-/ } });
    assert.equal(cert.status, 'DRAFT');

    // Transition to ISSUED
    cert.status = 'ISSUED';
    cert.issuedAt = new Date();
    cert.issuedBy = adminUser._id;
    await cert.save();

    const updated = await Certificate.findById(cert._id);
    assert.equal(updated.status, 'ISSUED');
    assert.ok(updated.issuedAt);
  });

  await t.test('5. Certificate Revocation with Mandatory Reason', async () => {
    const cert = await Certificate.findOne({ certificateId: { $regex: /^TEST-/ } });
    
    // Revoke
    const revocationReason = 'Disciplinary board found attendance falsified';
    cert.status = 'REVOKED';
    cert.revokedAt = new Date();
    cert.revokedBy = adminUser._id;
    cert.revocationReason = revocationReason;
    await cert.save();

    const revokedCert = await Certificate.findById(cert._id);
    assert.equal(revokedCert.status, 'REVOKED');
    assert.equal(revokedCert.revocationReason, revocationReason);
  });

  await t.test('6. QR Code Generation', async () => {
    const qrDataUrl = await generateQrDataUrl('https://nexora-innovations.com/verify/CERT-2026-0001');
    assert.ok(qrDataUrl.startsWith('data:image/png;base64,'), 'QR data URL valid');

    const qrBuffer = await generateQrBuffer('https://nexora-innovations.com/verify/CERT-2026-0001');
    assert.ok(Buffer.isBuffer(qrBuffer), 'QR Buffer generated');
    assert.ok(qrBuffer.length > 100, 'Buffer has positive size');
  });

  await t.test('7. PDF Generation', async () => {
    const cert = await Certificate.findOne({ certificateId: { $regex: /^TEST-/ } });
    const pdfBuffer = await generateCertificatePdf(cert);

    assert.ok(Buffer.isBuffer(pdfBuffer), 'PDF generated as buffer');
    assert.ok(pdfBuffer.length > 5000, 'PDF buffer has expected certificate byte size');
    // PDF magic bytes '%PDF'
    const magic = pdfBuffer.slice(0, 4).toString('ascii');
    assert.equal(magic, '%PDF', 'Valid PDF document header');
  });

  await t.test('8. Teardown', async () => {
    await Certificate.deleteMany({ certificateId: { $regex: /^TEST-/ } });
    await Admin.deleteMany({ email: 'testadmin@system.test' });
    await disconnectDB();
  });
});
