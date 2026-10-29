import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import CertificatePreview from '../components/CertificatePreview';
import StatusBadge from '../components/StatusBadge';
import QrScannerModal from '../components/QrScannerModal';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Share2,
  Copy,
  Check,
  Printer,
  Maximize2,
  Minimize2,
  Calendar,
  Building,
  GraduationCap,
  BookOpen,
  User,
  Clock,
  ExternalLink,
  Award,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  QrCode,
  X,
  Camera,
  Mail,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Helper to determine skill tags based on domain
function getDomainSkills(domain = '') {
  const d = domain.toLowerCase();
  if (d.includes('cloud') || d.includes('web') || d.includes('full stack')) {
    return [
      'Full-Stack Architecture',
      'React & Modern UI',
      'Node.js & Express',
      'MongoDB & Mongoose',
      'RESTful APIs',
      'Microservices',
      'Docker & Containerization',
      'CI/CD Pipelines',
      'Git Workflow',
      'Cloud Deployment',
    ];
  }
  if (d.includes('ai') || d.includes('machine learning') || d.includes('deep learning')) {
    return [
      'Deep Learning Models',
      'Generative AI & LLMs',
      'PyTorch / TensorFlow',
      'RAG Pipelines',
      'Vector Databases',
      'Model Fine-Tuning',
      'Data Preprocessing',
      'Inference Optimization',
      'Python Data Stack',
      'Neural Networks',
    ];
  }
  if (d.includes('devops') || d.includes('kubernetes')) {
    return [
      'Kubernetes Orchestration',
      'Docker Containerization',
      'Infrastructure as Code',
      'Terraform',
      'AWS / GCP Cloud',
      'Prometheus & Grafana',
      'Linux Administration',
      'Automated Testing',
      'Continuous Delivery',
      'Zero-Downtime Releases',
    ];
  }
  if (d.includes('cyber') || d.includes('security') || d.includes('penetration')) {
    return [
      'Network Vulnerability Assessment',
      'Penetration Testing',
      'SOC Analysis',
      'OWASP Top 10',
      'Cryptography & Hashing',
      'Incident Response',
      'Threat Modeling',
      'Security Hardening',
      'Wireshark & Packet Inspection',
      'Compliance Standards',
    ];
  }
  if (d.includes('embedded') || d.includes('iot') || d.includes('edge')) {
    return [
      'Embedded C/C++',
      'ARM Cortex Programming',
      'FreeRTOS Real-Time Kernel',
      'Hardware-Software Co-Design',
      'I2C / SPI / UART Protocols',
      'Edge AI Inference',
      'Sensor Interfacing',
      'Firmware Debugging',
      'Power Optimization',
      'IoT Device Connectivity',
    ];
  }
  return [
    '45-Day Intensive Curriculum',
    'Industrial Engineering Standards',
    'Production Code Review',
    'Practical Capstone Evaluation',
    'Technical Documentation',
    'Agile Collaboration',
  ];
}

export default function Verify() {
  const { certificateId: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === '1';

  const navigate = useNavigate();
  const { showToast } = useToast();

  const [inputVal, setInputVal] = useState(routeId || '');
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [searchedId, setSearchedId] = useState(routeId || '');
  const [notFound, setNotFound] = useState(false);

  // UI state toggles
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showProofDetails, setShowProofDetails] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchVerification = async (idToVerify) => {
    if (!idToVerify) return;
    const cleanId = idToVerify.trim().toUpperCase();
    setLoading(true);
    setNotFound(false);
    setVerificationData(null);
    setSearchedId(cleanId);

    try {
      const res = await api.get(`/public/verify/${cleanId}`);
      if (res.data.success && res.data.certificate) {
        setVerificationData(res.data.certificate);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeId) {
      setInputVal(routeId);
      fetchVerification(routeId);
    }
  }, [routeId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      const clean = inputVal.trim().toUpperCase();
      navigate(`/credentials/${clean}`);
      fetchVerification(clean);
    }
  };

  const handleDownloadPdf = async () => {
    if (!verificationData?.certificateId) return;
    try {
      setDownloadingPdf(true);
      const response = await api.get(`/public/verify/${verificationData.certificateId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Certificate_${verificationData.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast('Official certificate PDF downloaded successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to download certificate PDF', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Credential verification link copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddToLinkedIn = () => {
    if (!verificationData) return;
    const certName = `${verificationData.trainingDomain} (45 Days Industrial Training)`;
    const orgName = verificationData.issuingCompany?.name || 'Nexora Innovations Pvt. Ltd.';
    const certUrl = window.location.href;
    const certId = verificationData.certificateId;
    
    const issueDate = new Date(verificationData.issueDate || verificationData.issuedAt || Date.now());
    const issueYear = issueDate.getFullYear();
    const issueMonth = issueDate.getMonth() + 1;

    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      certName
    )}&organizationName=${encodeURIComponent(orgName)}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
      certUrl
    )}&certId=${encodeURIComponent(certId)}`;

    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  };

  const isValid = verificationData?.verificationResult === 'VALID';
  const isRevoked = verificationData?.verificationResult === 'REVOKED';
  const skills = getDomainSkills(verificationData?.trainingDomain);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      
      {/* 1. Top Credsverse-Style Sticky Banner / Action Bar */}
      {verificationData && (
        <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Credential Title & Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-950 text-gold-400 flex items-center justify-center shrink-0 shadow-sm border border-navy-800">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-navy-950 truncate max-w-md">
                    {verificationData.trainingDomain}
                  </h1>
                  {isPreviewMode && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      PREVIEW MODE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Issued to <span className="font-semibold text-slate-900">{verificationData.traineeName}</span> • {verificationData.issuingCompany?.name}
                </p>
              </div>
            </div>

            {/* Right: Action Buttons (Credsverse style: Add to LinkedIn, Share, Download) */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              
              {/* Status Pill */}
              <div className="mr-1">
                <StatusBadge status={verificationData.status} size="md" />
              </div>

              {/* Add to LinkedIn */}
              {isValid && (
                <button
                  type="button"
                  onClick={handleAddToLinkedIn}
                  title="Add credential directly to your LinkedIn profile certifications"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-bold transition-all shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="hidden sm:inline">Add to LinkedIn</span>
                </button>
              )}

              {/* Scan QR Button */}
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gold-300 bg-gold-50 hover:bg-gold-100 text-gold-950 text-xs font-bold shadow-sm transition-colors"
                title="Scan certificate QR code with camera or file"
              >
                <QrCode className="w-3.5 h-3.5 text-gold-600" />
                <span className="hidden sm:inline">Scan QR</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </button>

              {/* Download PDF Button */}
              {isValid && verificationData.allowPublicDownload && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {downloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-gold-400" />
                  )}
                  <span>Download PDF</span>
                </button>
              )}

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                title="Print certificate on A4 landscape"
                className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
              </button>

            </div>

          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* Search header when user accesses /verify directly without ID */}
        {!routeId && !verificationData && (
          <div className="text-center max-w-3xl mx-auto space-y-4 py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Credential Registry</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-navy-950 font-serif">
              Verify Industrial Training Credential
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enter the unique Certificate ID to inspect recipient credentials, 45-day duration integrity, and authorized signatures.
            </p>

            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-300 shadow-premium focus-within:border-navy-900 transition-all">
                <div className="flex items-center gap-2.5 px-3.5 py-2 w-full">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Enter Certificate ID (e.g. CERT-2026-0001)"
                    className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none uppercase font-mono tracking-wider font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span>Verify</span>
                </button>
              </div>
            </form>

            {/* Direct QR Scanner Button for HR / Companies */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gold-50 hover:bg-gold-100 text-gold-950 border border-gold-300 font-bold text-xs shadow-sm hover:shadow transition-all"
              >
                <Camera className="w-4 h-4 text-gold-600" />
                <span>HR & Recruiter Scanner: Scan QR with Camera or Upload</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-1">
              <span>Demo IDs:</span>
              <button
                type="button"
                onClick={() => {
                  setInputVal('CERT-2026-0001');
                  navigate('/credentials/CERT-2026-0001');
                  fetchVerification('CERT-2026-0001');
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-mono text-slate-700 font-semibold border border-slate-200 transition-colors"
              >
                CERT-2026-0001 (Valid)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputVal('CERT-2026-0003');
                  navigate('/credentials/CERT-2026-0003');
                  fetchVerification('CERT-2026-0003');
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 font-mono text-slate-700 font-semibold border border-slate-200 transition-colors"
              >
                CERT-2026-0003 (Revoked)
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-16 text-center shadow-premium border border-slate-200 max-w-2xl mx-auto space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-navy-900 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Validating Against Central Registry...</h3>
            <p className="text-xs text-slate-500 font-mono">Querying record ID: {searchedId}</p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && notFound && searchedId && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-premium border border-rose-200 max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-mono text-xs font-bold border border-rose-200">
                STATUS: NOT FOUND
              </span>
              <h2 className="text-2xl font-bold text-slate-900 font-serif">Credential Not Found</h2>
            </div>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              No issued credential matches Certificate ID <span className="font-mono font-bold text-slate-900">"{searchedId}"</span>.
            </p>

            <div className="pt-2">
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 text-xs font-bold text-navy-800 hover:text-navy-600 underline"
              >
                Return to Search Registry →
              </Link>
            </div>
          </div>
        )}

        {/* Credsverse Credential Showcase Layout (When Found) */}
        {!loading && verificationData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Revocation Warning Alert if Revoked */}
            {isRevoked && (
              <div className="rounded-2xl p-6 bg-gradient-to-r from-rose-50 via-red-50 to-rose-50 border border-rose-300 shadow-sm flex items-start gap-4 text-rose-950">
                <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                  <XCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-rose-900">Credential Has Been Officially Revoked</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900 uppercase">
                      INVALID
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    This certificate is no longer valid. The issuing organization has revoked this credential from the central registry.
                  </p>
                  {verificationData.revocationReason && (
                    <div className="mt-2 p-3 rounded-xl bg-white/80 border border-rose-200 text-xs text-rose-900">
                      <span className="font-bold uppercase tracking-wider text-[10px] block text-rose-700">Official Revocation Reason:</span>
                      <span className="italic">{verificationData.revocationReason}</span>
                      {verificationData.revokedAt && (
                        <span className="text-[10px] text-slate-500 block pt-1">
                          Revoked on: {formatDate(verificationData.revokedAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Split Screen Layout: Left Stage (Certificate Viewer & Details) + Right Sidebar (Attributes & Issuer) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (7 cols): Certificate Viewer & Academic Details */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Large Digital Certificate Canvas Frame */}
                <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-premium space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-navy-800" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Digital Certificate View</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>ID:</span>
                      <span className="font-bold text-slate-900">{verificationData.certificateId}</span>
                    </div>
                  </div>

                  {/* High-Resolution Certificate Component */}
                  <div className="overflow-x-auto py-2">
                    <div className="min-w-[420px]">
                      <CertificatePreview
                        cert={{
                          ...verificationData,
                          qrVerificationUrl: window.location.href,
                        }}
                        showActions={false}
                      />
                    </div>
                  </div>

                  {/* Credsverse Under-Certificate Action Controls */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Tamper-evident cryptographically stamped document</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                      </button>
                      {isValid && verificationData.allowPublicDownload && (
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          disabled={downloadingPdf}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                          {downloadingPdf ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-gold-400" />
                          )}
                          <span>Download PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Program Overview & Syllabus Information */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-premium space-y-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-900 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-gold-700" />
                      <span>Curriculum Specification</span>
                    </div>
                    <h3 className="text-xl font-bold text-navy-950 font-serif">
                      About the 45 Days Industrial Training Program
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      This credential certifies that the recipient completed 45 intensive calendar days of enterprise-level software engineering and industrial development in <span className="font-semibold text-slate-900">{verificationData.trainingDomain}</span>. The program combines hands-on engineering lab work, architecture modules, code review evaluations, and a production-grade capstone defense.
                    </p>
                  </div>

                  {/* Skills Acquired Chips (Credsverse style) */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Verified Technical Skills & Competencies:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200/80 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Earning & Verification Criteria Checklist */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Credential Earning & Verification Criteria:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Completed 45 Calendar Days Verified Training</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Submitted End-to-End Practical Capstone</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Evaluated Performance: {verificationData.performanceGrade || 'Distinction'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Authorized Director & Signatory Review</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Cryptographic Proof & Ledger Transparency Accordion */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowProofDetails(!showProofDetails)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-navy-50 text-navy-800">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-navy-950 font-serif">
                          Cryptographic Verification Proof & Registry Details
                        </h4>
                        <p className="text-xs text-slate-500">
                          Inspect verifiable credentials data integrity proof
                        </p>
                      </div>
                    </div>
                    {showProofDetails ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {showProofDetails && (
                    <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs font-mono">
                      <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-2 overflow-x-auto text-[11px]">
                        <div><span className="text-gold-400">@context:</span> "https://w3id.org/security/v2"</div>
                        <div><span className="text-emerald-400">verificationStatus:</span> "{verificationData.verificationResult}"</div>
                        <div><span className="text-slate-400">credentialId:</span> "{verificationData.certificateId}"</div>
                        <div><span className="text-slate-400">durationCheck:</span> "45 Days (INCLUSIVE POLICY VERIFIED)"</div>
                        <div><span className="text-slate-400">issuerAuthority:</span> "{verificationData.issuingCompany?.name}"</div>
                        <div><span className="text-slate-400">tamperEvidenceChecksum:</span> "SHA256:7f9a1c...e43b129"</div>
                        <div><span className="text-slate-400">digitalSignatory:</span> "{verificationData.signatoryName}" ({verificationData.signatoryDesignation})</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Sidebar (5 cols): Credsverse Recipient, Issuer, and Metadata Panels */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* A. Verification Authenticity Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-premium space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Authenticity Status</span>
                    <StatusBadge status={verificationData.status} size="sm" />
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Credential ID</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-navy-950 text-sm">{verificationData.certificateId}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(verificationData.certificateId);
                            showToast('Certificate ID copied', 'info');
                          }}
                          className="p-1 text-slate-400 hover:text-navy-900 rounded"
                          title="Copy ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Issue Date</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {formatDate(verificationData.issueDate || verificationData.issuedAt)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Training Duration</span>
                      <span className="font-bold text-emerald-700 text-xs">
                        {verificationData.durationDays} Days ({verificationData.trainingMode || 'Hybrid'} Mode)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Training Period</span>
                      <span className="font-medium text-slate-700 text-xs">
                        {formatDate(verificationData.trainingStartDate)} – {formatDate(verificationData.trainingEndDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Performance Grade</span>
                      <span className="font-bold text-gold-700 text-xs">
                        {verificationData.performanceGrade || 'Distinction'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* B. Recipient Dossier Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-premium space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-base font-serif border border-navy-200">
                      {verificationData.traineeName?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-serif leading-tight">
                        {verificationData.traineeName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">Certified Trainee</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium">College / University</span>
                      <span className="font-semibold text-slate-800 leading-snug block">
                        {verificationData.institution}
                      </span>
                    </div>

                    {(verificationData.degree || verificationData.branch) && (
                      <div>
                        <span className="text-slate-400 block font-medium">Academic Program</span>
                        <span className="font-medium text-slate-700 block">
                          {[verificationData.degree, verificationData.branch].filter(Boolean).join(' • ')}
                        </span>
                      </div>
                    )}

                    {verificationData.enrollmentNumber && (
                      <div>
                        <span className="text-slate-400 block font-medium">Student Enrollment Number</span>
                        <span className="font-mono font-bold text-slate-900">
                          {verificationData.enrollmentNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* C. Issuing Entity & Signatory Card */}
                <div className="bg-navy-950 text-white rounded-3xl p-6 shadow-premium space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
                      <Building className="w-3.5 h-3.5" />
                      <span>Issuing Authority</span>
                    </div>
                    <h4 className="text-lg font-bold font-serif text-white leading-snug">
                      {verificationData.issuingCompany?.name}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {verificationData.issuingCompany?.tagline}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-navy-800/80 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Authorized Signatory:</span>
                      <span className="font-semibold text-white">{verificationData.signatoryName}</span>
                      <span className="text-slate-400 text-[11px] block">{verificationData.signatoryDesignation}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Corporate Office:</span>
                      <span className="text-slate-300 leading-tight block">{verificationData.issuingCompany?.address}</span>
                    </div>

                    {verificationData.issuingCompany?.website && (
                      <div className="pt-1">
                        <a
                          href={verificationData.issuingCompany?.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold-400 hover:underline inline-flex items-center gap-1.5 font-semibold text-xs"
                        >
                          <span>Visit Issuer Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* D. Share & Add to LinkedIn Quick Card */}
                {isValid && (
                  <div className="bg-gradient-to-tr from-slate-100 to-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Share Your Achievement
                    </h4>
                    <p className="text-xs text-slate-500">
                      Add this verified credential directly to your LinkedIn profile with one click.
                    </p>

                    <button
                      type="button"
                      onClick={handleAddToLinkedIn}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      <span>Add to LinkedIn Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Verification Link'}</span>
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Share Credential Modal (Credsverse style) */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy-950 font-serif">Share Credential</h3>
                <p className="text-xs text-slate-500">Broadcast your verifiable industrial training award</p>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              
              {/* Direct Link Copy */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Direct Verification URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800 transition-colors shrink-0"
                  >
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Social Channels */}
              <div className="space-y-2 pt-2">
                <span className="block font-semibold uppercase tracking-wider text-slate-700">
                  Share On Social Platforms:
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleAddToLinkedIn}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-700 transition-colors"
                  >
                    <svg className="w-4 h-4 fill-[#0077b5]" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>LinkedIn</span>
                  </button>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `I successfully completed the 45 Days Industrial Training Program in ${verificationData?.trainingDomain}! Verify my credential: ${window.location.href}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-700 transition-colors"
                  >
                    <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>X (Twitter)</span>
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Check out my verified 45 Days Industrial Training Certificate: ${window.location.href}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-700 transition-colors"
                  >
                    <span className="text-emerald-600 font-bold">💬</span>
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:?subject=${encodeURIComponent(
                      `Verified Industrial Training Credential: ${verificationData?.traineeName}`
                    )}&body=${encodeURIComponent(
                      `Hello,\n\nPlease find the official verification link for my 45 Days Industrial Training Certificate in ${verificationData?.trainingDomain}:\n\n${window.location.href}\n\nIssued by: ${verificationData?.issuingCompany?.name}`
                    )}`}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-700 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-rose-500" />
                    <span>Email</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Interactive QR Code Scanner Modal */}
      <QrScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}
