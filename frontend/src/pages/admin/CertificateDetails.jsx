import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import CertificatePreview from '../../components/CertificatePreview';
import StatusBadge from '../../components/StatusBadge';
import RevokeModal from '../../components/RevokeModal';
import {
  Download,
  CheckCircle,
  XCircle,
  Edit3,
  Calendar,
  User,
  GraduationCap,
  Award,
  Clock,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  Loader2,
  FileText,
  History,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CertificateDetails() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  // Amendment Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    traineeName: '',
    institution: '',
    degree: '',
    branch: '',
    trainingDomain: '',
    performanceGrade: '',
    amendmentReason: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/certificates/${certificateId}`);
      if (res.data.success && res.data.data) {
        setCert(res.data.data);
        setEditForm({
          traineeName: res.data.data.traineeName || '',
          institution: res.data.data.institution || '',
          degree: res.data.data.degree || '',
          branch: res.data.data.branch || '',
          trainingDomain: res.data.data.trainingDomain || '',
          performanceGrade: res.data.data.performanceGrade || '',
          amendmentReason: '',
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to load certificate dossier', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificate();
  }, [certificateId]);

  const handleDownloadPdf = async () => {
    if (!cert?.certificateId) return;
    try {
      setDownloadingPdf(true);
      const response = await api.get(`/certificates/${cert.certificateId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Certificate_${cert.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast(`Certificate ${cert.certificateId} PDF downloaded.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to download certificate PDF', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleIssue = async () => {
    try {
      const res = await api.post(`/certificates/${cert.certificateId}/issue`);
      if (res.data.success) {
        showToast(`Certificate ${cert.certificateId} has been officially issued.`, 'success');
        loadCertificate();
      }
    } catch (err) {
      showToast(err.message || 'Failed to issue certificate', 'error');
    }
  };

  const handleRevokeConfirm = async (reason) => {
    try {
      const res = await api.post(`/certificates/${cert.certificateId}/revoke`, { reason });
      if (res.data.success) {
        showToast(`Certificate ${cert.certificateId} has been revoked.`, 'info');
        loadCertificate();
      }
    } catch (err) {
      showToast(err.message || 'Revocation failed', 'error');
      throw err;
    }
  };

  const handleSaveAmendment = async (e) => {
    e.preventDefault();
    if (cert.status === 'ISSUED' && (!editForm.amendmentReason || editForm.amendmentReason.trim().length < 5)) {
      showToast('A detailed reason (minimum 5 characters) is required to amend an issued certificate.', 'error');
      return;
    }

    try {
      setSavingEdit(true);
      const res = await api.patch(`/certificates/${cert.certificateId}`, editForm);
      if (res.data.success) {
        showToast('Certificate successfully updated and amendment logged.', 'success');
        setEditModalOpen(false);
        loadCertificate();
      }
    } catch (err) {
      showToast(err.message || 'Amendment failed', 'error');
    } finally {
      setSavingEdit(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
        <p className="text-sm text-slate-500 font-medium">Retrieving certificate record...</p>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Certificate Not Found</h2>
        <p className="text-sm text-slate-500">Record does not exist in registry.</p>
        <Link to="/admin/certificates" className="text-sm font-bold text-navy-800 underline">
          Return to Registry Overview
        </Link>
      </div>
    );
  }

  const isIssued = cert.status === 'ISSUED';
  const isDraft = cert.status === 'DRAFT';
  const isRevoked = cert.status === 'REVOKED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            to="/admin/certificates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Certificates</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-serif">
              {cert.certificateId}
            </h1>
            <StatusBadge status={cert.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Trainee: {cert.traineeName} • {cert.trainingDomain}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
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
            <span>Download A4 PDF</span>
          </button>

          <Link
            to={`/verify/${cert.certificateId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Public Verify URL</span>
          </Link>

          {!isRevoked && (
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isDraft ? 'Edit Details' : 'Amend Certificate'}</span>
            </button>
          )}

          {isDraft && (
            <button
              type="button"
              onClick={handleIssue}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Issue Credential</span>
            </button>
          )}

          {isIssued && (
            <button
              type="button"
              onClick={() => setRevokeOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Revoke</span>
            </button>
          )}

        </div>
      </div>

      {/* Revocation Banner if Revoked */}
      {isRevoked && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>This Certificate was officially Revoked</span>
          </div>
          <p className="text-xs text-rose-800 pl-7">
            Reason: <span className="font-semibold">{cert.revocationReason || 'Disciplinary / Non-fulfillment'}</span>
          </p>
          <p className="text-[11px] text-slate-500 pl-7">
            Revoked At: {formatDate(cert.revokedAt)} by {cert.revokedBy?.name || 'Administrator'}
          </p>
        </div>
      )}

      {/* Grid: Trainee Dossier + Visual Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 5 Cols: Structured Dossier & Audit History */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-premium space-y-5">
            <h3 className="text-base font-bold text-navy-950 font-serif border-b border-slate-100 pb-2">
              Trainee & Academic Record
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Trainee Full Name</span>
                <span className="text-sm font-bold text-slate-900">{cert.traineeName}</span>
              </div>

              {cert.fatherName && (
                <div>
                  <span className="text-slate-400 block font-medium">Father's Name</span>
                  <span className="font-semibold text-slate-800">{cert.fatherName}</span>
                </div>
              )}

              <div>
                <span className="text-slate-400 block font-medium">Institution / University</span>
                <span className="font-semibold text-slate-800">{cert.institution}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Course & Branch</span>
                <span className="font-medium text-slate-800">
                  {[cert.degree, cert.branch].filter(Boolean).join(' - ')}
                </span>
              </div>

              {cert.enrollmentNumber && (
                <div>
                  <span className="text-slate-400 block font-medium">Enrollment Number</span>
                  <span className="font-mono font-bold text-slate-900">{cert.enrollmentNumber}</span>
                </div>
              )}

              <div>
                <span className="text-slate-400 block font-medium">Training Domain</span>
                <span className="font-bold text-navy-900">{cert.trainingDomain}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 block font-medium">Start Date</span>
                  <span className="font-medium text-slate-800">{formatDate(cert.trainingStartDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Completion Date</span>
                  <span className="font-medium text-slate-800">{formatDate(cert.trainingEndDate)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">Duration</span>
                  <span className="font-bold text-emerald-700">{cert.durationDays} Days ({cert.trainingMode})</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Grade</span>
                  <span className="font-bold text-slate-800">{cert.performanceGrade || 'Distinction'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Authorized Signatory</span>
                <span className="font-semibold text-slate-900">{cert.signatoryName}</span>
                <span className="text-[11px] text-slate-500 block">{cert.signatoryDesignation}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Verification URL</span>
                <span className="text-[10px] text-navy-700 font-mono break-all">{cert.qrVerificationUrl}</span>
              </div>
            </div>
          </div>

          {/* Controlled Amendment History Timeline */}
          {cert.amendmentHistory?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-premium space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <History className="w-4 h-4 text-navy-800" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950">
                  Amendment Audit Trail ({cert.amendmentHistory.length})
                </h4>
              </div>

              <div className="space-y-3">
                {cert.amendmentHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">
                        Amended by {item.amendedBy?.name || 'Administrator'}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {formatDate(item.amendedAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 italic">
                      Reason: "{item.reason}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 7 Cols: Full Certificate Visual Document */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-100 rounded-3xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-navy-950 font-serif">Document Layout Preview</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-100 text-navy-900 font-bold">
                A4 LANDSCAPE
              </span>
            </div>

            <CertificatePreview
              cert={cert}
              showActions={true}
              onDownloadPdf={handleDownloadPdf}
            />
          </div>
        </div>

      </div>

      {/* Revoke Modal */}
      <RevokeModal
        isOpen={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        certificateId={cert.certificateId}
        onConfirm={handleRevokeConfirm}
      />

      {/* Amendment Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isDraft ? 'Edit Draft Certificate' : 'Amend Issued Certificate'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{cert.certificateId}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAmendment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Trainee Full Name
                </label>
                <input
                  type="text"
                  value={editForm.traineeName}
                  onChange={(e) => setEditForm({ ...editForm, traineeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={editForm.institution}
                  onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={editForm.degree}
                    onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={editForm.branch}
                    onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Training Domain
                </label>
                <input
                  type="text"
                  value={editForm.trainingDomain}
                  onChange={(e) => setEditForm({ ...editForm, trainingDomain: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              {/* Mandatory amendment reason if already ISSUED */}
              {isIssued && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-bold uppercase tracking-wider text-rose-700 mb-1">
                    Mandatory Amendment Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.amendmentReason}
                    onChange={(e) => setEditForm({ ...editForm, amendmentReason: e.target.value })}
                    placeholder="e.g. Corrected typo in student institution name per official college request letter..."
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    This reason is permanently preserved in the certificate's immutable audit log.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-navy-950 text-white font-bold hover:bg-navy-900 disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Apply Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
