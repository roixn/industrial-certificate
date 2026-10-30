import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Award, ShieldCheck, Printer, Download } from 'lucide-react';

export default function CertificatePreview({ cert, showActions = true, onDownloadPdf }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Fallback to current public origin or Cloudflare tunnel so camera scan always works
  const verificationUrl =
    cert?.qrVerificationUrl && !cert.qrVerificationUrl.includes('localhost') && !cert.qrVerificationUrl.includes('127.0.0.1')
      ? cert.qrVerificationUrl
      : cert?.certificateId
      ? `${window.location.origin}/credentials/${cert.certificateId}`
      : 'https://nut-disturbed-favourites-situated.trycloudflare.com/credentials';

  useEffect(() => {
    if (verificationUrl) {
      QRCode.toDataURL(verificationUrl, {
        margin: 1,
        width: 256,
        color: {
          dark: '#0f1f38',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Failed to generate preview QR', err));
    }
  }, [verificationUrl]);

  if (!cert) return null;

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return isNaN(date.getTime())
      ? d
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Top Action Bar if enabled */}
      {showActions && (
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Document View</span>
            <span className="text-xs px-2 py-0.5 rounded bg-navy-100 text-navy-800 font-bold font-mono">
              {cert.certificateId || 'PREVIEW'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print A4</span>
            </button>
            {onDownloadPdf && (
              <button
                onClick={onDownloadPdf}
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-gold-400" />
                <span>Download Official PDF</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* The Printable A4 Landscape Certificate Area */}
      <div
        id="certificate-print-area"
        className="w-full max-w-4xl aspect-[1.414/1] bg-white rounded-xl shadow-premium-lg border border-slate-200/80 p-6 sm:p-8 relative overflow-hidden transition-all text-slate-800 select-none"
      >
        {/* Outer Navy Border */}
        <div className="w-full h-full border-4 sm:border-[6px] border-navy-950 p-2 sm:p-3 relative flex flex-col justify-between">
          
          {/* Inner Gold Border */}
          <div className="w-full h-full border sm:border-2 border-gold-500/80 p-3 sm:p-5 relative flex flex-col justify-between">
            
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-gold-600 pointer-events-none" />
            <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-gold-600 pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-gold-600 pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-gold-600 pointer-events-none" />

            {/* Top Header: Company Branding */}
            <div className="text-center pt-1 sm:pt-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="w-5 h-5 text-gold-600" />
                <h2 className="text-base sm:text-xl font-black uppercase tracking-widest text-navy-950 font-serif">
                  {cert.companySnapshot?.name || cert.companyName || 'NEXORA INNOVATIONS PVT. LTD.'}
                </h2>
              </div>
              <p className="text-[9px] sm:text-[11px] font-medium tracking-wider text-slate-500 uppercase">
                {cert.companySnapshot?.tagline || 'Center for Advanced Industrial Training & Engineering Excellence'}
              </p>
              <div className="w-48 sm:w-64 h-[1.5px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-2 sm:mt-3" />
            </div>

            {/* Certificate Title */}
            <div className="text-center my-1 sm:my-2">
              <h1 className="text-xl sm:text-3xl font-extrabold uppercase tracking-wider text-gold-700 font-serif mb-0.5">
                Certificate of Completion
              </h1>
              <div className="inline-block px-3 py-0.5 rounded-full bg-navy-50 border border-navy-200">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-navy-900 uppercase">
                  45 Days Industrial Training Program
                </span>
              </div>
            </div>

            {/* Trainee Presentation & Body */}
            <div className="text-center space-y-1.5 sm:space-y-2 px-4 sm:px-12 my-auto">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 italic">
                This is proudly presented to
              </p>

              {/* Trainee Full Name */}
              <div className="relative inline-block my-1">
                <h3 className="text-xl sm:text-3xl font-extrabold text-navy-950 font-serif uppercase tracking-wide">
                  {cert.traineeName || 'TRAINEE FULL NAME'}
                </h3>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent mt-1" />
              </div>

              {/* Institution and Program */}
              <p className="text-[11px] sm:text-xs text-slate-700">
                of <span className="font-semibold text-slate-900">{cert.institution || 'Recognized Technical University'}</span>
                {cert.enrollmentNumber && (
                  <span className="text-slate-500"> (Enrollment No: {cert.enrollmentNumber})</span>
                )}
              </p>

              {(cert.degree || cert.branch) && (
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Program: {[cert.degree, cert.branch].filter(Boolean).join(' — ')}
                </p>
              )}

              {/* Completion Statement */}
              <p className="text-[11px] sm:text-xs text-slate-600 pt-1">
                has successfully completed the intensive 45 Days Industrial Training Curriculum in
              </p>

              <div className="text-sm sm:text-lg font-bold text-navy-900 tracking-tight">
                {cert.trainingDomain || 'Advanced Engineering Curriculum'}
              </div>

              <p className="text-[10px] sm:text-xs text-slate-600">
                conducted from <span className="font-semibold text-slate-800">{formatDate(cert.trainingStartDate)}</span> to{' '}
                <span className="font-semibold text-slate-800">{formatDate(cert.trainingEndDate)}</span> ({cert.durationDays || 45} Days, {cert.trainingMode || 'Hybrid'} Mode)
              </p>

              {cert.performanceGrade && (
                <p className="text-[10px] sm:text-xs font-semibold text-gold-800 pt-0.5">
                  Evaluation Performance: {cert.performanceGrade}
                </p>
              )}
            </div>

            {/* Bottom Section: QR Verification (Left) and Signatory (Right) */}
            <div className="flex items-end justify-between pt-2 px-2 sm:px-6 border-t border-slate-100">
              
              {/* Left: Official Aadhaar-Style Security QR Block */}
              <div className="flex items-center gap-3 p-1.5 sm:p-2 rounded-xl bg-slate-50/90 border border-gold-400 shadow-sm">
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Official Verification QR Code • Scan with any phone camera to verify authenticity"
                  className="p-1 rounded-lg bg-white border border-slate-300 shadow-sm shrink-0 hover:scale-105 transition-transform group cursor-pointer block"
                >
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Certificate Verification QR Code" className="w-16 h-16 sm:w-20 sm:h-20" />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                      QR Code
                    </div>
                  )}
                </a>
                <div className="text-left space-y-0.5 text-[9px] sm:text-[10px] text-slate-600 max-w-[210px]">
                  <div className="font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>DIGITALLY VERIFIED CREDENTIAL</span>
                  </div>
                  <p className="text-[8.5px] sm:text-[9.5px] text-slate-700 font-medium leading-tight">
                    Scan with any phone camera to view official certified authorization.
                  </p>
                  <div>
                    <span className="font-semibold text-slate-500">ID: </span>
                    <span className="font-mono text-navy-950 font-bold">{cert.certificateId || 'PENDING'}</span>
                  </div>
                  <div className="text-[8px] sm:text-[8.5px] text-slate-500 truncate font-mono">
                    {verificationUrl}
                  </div>
                </div>
              </div>

              {/* Right: Signatory */}
              <div className="text-center w-48 sm:w-56 pb-1">
                {/* Visual signature stylized font or placeholder */}
                <div className="h-7 sm:h-9 flex items-center justify-center">
                  <span className="font-serif italic text-base sm:text-lg text-navy-900 font-bold tracking-wider opacity-90 select-none">
                    {cert.signatoryName || 'R. K. Sharma'}
                  </span>
                </div>
                <div className="w-full h-[1px] bg-slate-400 mx-auto mb-1" />
                <p className="text-[10px] sm:text-xs font-bold text-navy-950">
                  {cert.signatoryName || 'Dr. Rajesh K. Sharma'}
                </p>
                <p className="text-[8px] sm:text-[9px] text-slate-500 font-medium">
                  {cert.signatoryDesignation || 'Director of Technical Training'}
                </p>
                <p className="text-[8px] sm:text-[9px] text-slate-400 italic">
                  {cert.companySnapshot?.name || cert.companyName || 'Nexora Innovations'}
                </p>
              </div>

            </div>

            {/* Bottom Registry Strip */}
            <div className="text-center pt-1.5 text-[8px] sm:text-[9px] text-slate-600 border-t border-slate-100">
              Official Credential Document • Verified 45 Days Duration Policy • Tamper-resistant cryptographic registry record.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
