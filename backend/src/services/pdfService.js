import PDFDocument from 'pdfkit';
import { generateQrBuffer } from './qrService.js';

/**
 * Format a Date object into a readable date string: "October 29, 2026"
 * @param {Date|string} date 
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generates an A4 Landscape PDF stream/buffer for an issued certificate
 * @param {Object} cert - Certificate document
 * @returns {Promise<Buffer>}
 */
export async function generateCertificatePdf(cert) {
  return new Promise(async (resolve, reject) => {
    try {
      // A4 Landscape dimensions: 841.89 pt x 595.28 pt
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 30, bottom: 30, left: 36, right: 36 },
        info: {
          Title: `Certificate_${cert.certificateId}`,
          Author: cert.companySnapshot?.name || 'Industrial Training Certification Authority',
          Subject: `Industrial Training Certificate - ${cert.traineeName}`,
          Keywords: 'Certificate, Industrial Training, Verification',
          CreationDate: new Date(),
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const width = doc.page.width;
      const height = doc.page.height;

      // Color Palette
      const NAVY_DARK = '#0f1f38';
      const NAVY_LIGHT = '#1e3a8a';
      const GOLD_PRIMARY = '#b8860b';
      const GOLD_LIGHT = '#dfb842';
      const TEXT_MUTED = '#475569';
      const TEXT_MAIN = '#1e293b';

      // 1. Background Fill
      doc.rect(0, 0, width, height).fill('#ffffff');

      // 2. Decorative Outer Borders
      // Outer Navy border
      doc.lineWidth(8);
      doc.rect(18, 18, width - 36, height - 36).stroke(NAVY_DARK);

      // Thin inner gold border
      doc.lineWidth(2);
      doc.rect(26, 26, width - 52, height - 52).stroke(GOLD_PRIMARY);

      // Fine inner navy hairline
      doc.lineWidth(0.5);
      doc.rect(30, 30, width - 60, height - 60).stroke(NAVY_DARK);

      // Corner ornamental accents (L-shaped bracket marks at four corners)
      const cornerOffset = 34;
      const cornerLen = 22;
      doc.lineWidth(2.5).strokeColor(GOLD_PRIMARY);

      // Top-Left
      doc.moveTo(cornerOffset, cornerOffset + cornerLen).lineTo(cornerOffset, cornerOffset).lineTo(cornerOffset + cornerLen, cornerOffset).stroke();
      // Top-Right
      doc.moveTo(width - cornerOffset - cornerLen, cornerOffset).lineTo(width - cornerOffset, cornerOffset).lineTo(width - cornerOffset, cornerOffset + cornerLen).stroke();
      // Bottom-Left
      doc.moveTo(cornerOffset, height - cornerOffset - cornerLen).lineTo(cornerOffset, height - cornerOffset).lineTo(cornerOffset + cornerLen, height - cornerOffset).stroke();
      // Bottom-Right
      doc.moveTo(width - cornerOffset - cornerLen, height - cornerOffset).lineTo(width - cornerOffset, height - cornerOffset).lineTo(width - cornerOffset, height - cornerOffset - cornerLen).stroke();

      // 3. Top Header: Company Name & Title
      const companyName = (cert.companySnapshot?.name || 'NEXORA INNOVATIONS PVT. LTD.').toUpperCase();
      const companyTagline = cert.companySnapshot?.tagline || 'CENTER FOR ADVANCED INDUSTRIAL TRAINING & ENGINEERING EXCELLENCE';

      doc.fillColor(NAVY_DARK)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(companyName, 50, 48, { align: 'center', characterSpacing: 1.5 });

      doc.fillColor(TEXT_MUTED)
         .fontSize(8.5)
         .font('Helvetica')
         .text(companyTagline, 50, 68, { align: 'center', characterSpacing: 1 });

      // Gold decorative divider
      doc.lineWidth(1.5).strokeColor(GOLD_LIGHT);
      doc.moveTo(width / 2 - 140, 84).lineTo(width / 2 + 140, 84).stroke();

      // 4. Main Certificate Heading
      doc.fillColor(GOLD_PRIMARY)
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF COMPLETION', 50, 96, { align: 'center', characterSpacing: 2 });

      doc.fillColor(NAVY_LIGHT)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('45 DAYS INDUSTRIAL TRAINING PROGRAM', 50, 126, { align: 'center', characterSpacing: 1.2 });

      // 5. Body Text
      doc.fillColor(TEXT_MUTED)
         .fontSize(11)
         .font('Helvetica')
         .text('This is to certify that', 50, 154, { align: 'center' });

      // Trainee Name (Prominent & highlighted)
      const traineeName = (cert.traineeName || 'Trainee Name').toUpperCase();
      doc.fillColor(NAVY_DARK)
         .fontSize(23)
         .font('Helvetica-Bold')
         .text(traineeName, 50, 172, { align: 'center', characterSpacing: 1 });

      // Subtle underline for trainee name
      const nameWidth = Math.min(doc.widthOfString(traineeName) + 40, width - 160);
      doc.lineWidth(1).strokeColor(GOLD_PRIMARY);
      doc.moveTo(width / 2 - nameWidth / 2, 202).lineTo(width / 2 + nameWidth / 2, 202).stroke();

      // Institution & Academic details
      const institutionText = cert.institution ? `of ${cert.institution}` : '';
      const academicDetails = [cert.degree, cert.branch].filter(Boolean).join(' in ');
      const enrollText = cert.enrollmentNumber ? ` (Enrollment No: ${cert.enrollmentNumber})` : '';

      doc.fillColor(TEXT_MAIN)
         .fontSize(10.5)
         .font('Helvetica')
         .text(`${institutionText}${enrollText ? enrollText : ''}`, 70, 212, { align: 'center' });

      if (academicDetails) {
        doc.fillColor(TEXT_MUTED)
           .fontSize(10)
           .font('Helvetica')
           .text(`Program of Study: ${academicDetails}`, 70, 228, { align: 'center' });
      }

      // Completion statement
      const startDateStr = formatDate(cert.trainingStartDate);
      const endDateStr = formatDate(cert.trainingEndDate);
      const domainName = cert.trainingDomain || 'Advanced Software Systems';
      const trainingMode = cert.trainingMode || 'Hybrid';

      const certBodyText = `has successfully completed the intensive 45 Days Industrial Training Program in`;
      doc.fillColor(TEXT_MUTED)
         .fontSize(11)
         .font('Helvetica')
         .text(certBodyText, 70, 248, { align: 'center' });

      doc.fillColor(NAVY_DARK)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(domainName, 70, 266, { align: 'center' });

      const dateDurationSentence = `conducted from ${startDateStr} to ${endDateStr} (${cert.durationDays || 45} Days, ${trainingMode} Mode).`;
      doc.fillColor(TEXT_MAIN)
         .fontSize(10.5)
         .font('Helvetica')
         .text(dateDurationSentence, 70, 288, { align: 'center' });

      if (cert.performanceGrade) {
        doc.fillColor(TEXT_MUTED)
           .fontSize(9.5)
           .font('Helvetica-Bold')
           .text(`Performance Assessment: ${cert.performanceGrade}`, 70, 306, { align: 'center' });
      }

      // 6. Bottom Signatures and QR Code Verification Block (Aadhaar / Official Security Standard)
      // Bottom section Y: 360 to 520
      const bottomY = 365;

      // Determine live public verification URL (Aadhaar-standard direct camera scan)
      const defaultDomain = (process.env.PUBLIC_VERIFY_BASE_URL || 'https://nut-disturbed-favourites-situated.trycloudflare.com/credentials').replace(/\/+$/, '');
      let effectiveQrUrl = cert.qrVerificationUrl;
      if (!effectiveQrUrl || effectiveQrUrl.includes('localhost') || effectiveQrUrl.includes('127.0.0.1')) {
        effectiveQrUrl = `${defaultDomain}/${cert.certificateId}`;
      }

      const qrBuffer = await generateQrBuffer(effectiveQrUrl);

      // Embedded QR Code on bottom-left / center-left (Prominent size for instant camera lock)
      const qrSize = 105;
      const qrX = 60;
      const qrY = bottomY;

      // Outer security container box for QR block (Aadhaar-card style)
      doc.rect(qrX - 8, qrY - 8, 305, qrSize + 16).lineWidth(1).strokeColor(GOLD_PRIMARY);
      doc.rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10).lineWidth(0.5).strokeColor(NAVY_DARK);

      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      // QR metadata right of QR
      const metaX = qrX + qrSize + 14;
      doc.fillColor('#15803d')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('✔ DIGITALLY VERIFIED CREDENTIAL', metaX, qrY + 2);

      doc.fillColor(NAVY_DARK)
         .fontSize(8.5)
         .font('Helvetica-Bold')
         .text('Scan QR with phone camera to verify authenticity.', metaX, qrY + 16, { width: 175 });

      doc.fillColor(TEXT_MUTED)
         .fontSize(7.5)
         .font('Helvetica')
         .text('Redirects directly to certified registry record.', metaX, qrY + 38, { width: 175 });

      doc.fillColor(TEXT_MAIN)
         .fontSize(8.5)
         .font('Helvetica-Bold')
         .text(`Certificate ID: `, metaX, qrY + 54, { continued: true })
         .font('Helvetica')
         .text(cert.certificateId);

      doc.font('Helvetica-Bold')
         .text(`Issue Date: `, metaX, qrY + 68, { continued: true })
         .font('Helvetica')
         .text(formatDate(cert.issueDate || cert.issuedAt));

      doc.font('Helvetica-Bold')
         .text(`Status: `, metaX, qrY + 82, { continued: true })
         .fillColor(cert.status === 'ISSUED' ? '#15803d' : cert.status === 'REVOKED' ? '#b91c1c' : '#b45309')
         .text(cert.status === 'ISSUED' ? 'OFFICIALLY VALID' : cert.status);

      // Center/Right Column: Official Seal & Authorized Signatory
      const signX = width - 260;
      const signY = bottomY + 45;

      // Signature line
      doc.lineWidth(1).strokeColor(NAVY_DARK);
      doc.moveTo(signX, signY).lineTo(signX + 190, signY).stroke();

      doc.fillColor(NAVY_DARK)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(cert.signatoryName || 'Authorized Signatory', signX, signY + 6, { width: 190, align: 'center' });

      doc.fillColor(TEXT_MUTED)
         .fontSize(8.5)
         .font('Helvetica')
         .text(cert.signatoryDesignation || 'Director of Training', signX, signY + 20, { width: 190, align: 'center' });

      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .text(cert.companySnapshot?.name || 'Nexora Innovations Pvt. Ltd.', signX, signY + 33, { width: 190, align: 'center' });

      // 7. Security / Registry statement at very bottom
      doc.fillColor('#94a3b8')
         .fontSize(7)
         .font('Helvetica')
         .text(
           `Verification URL: ${cert.qrVerificationUrl} | Official Document ID: ${cert.certificateId} | Digitally generated and cryptographically tracked.`,
           50,
           height - 48,
           { align: 'center' }
         );

      doc.end();
    } catch (err) {
      console.error('[PDF Service] Error generating certificate PDF:', err);
      reject(err);
    }
  });
}
