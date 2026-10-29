import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import RevokeModal from '../../components/RevokeModal';
import {
  Search,
  Filter,
  PlusCircle,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CertificateList() {
  const { showToast } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Revoke Modal state
  const [revokeTarget, setRevokeTarget] = useState(null);

  const loadCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (domainFilter) params.append('domain', domainFilter);

      const res = await api.get(`/certificates?${params.toString()}`);
      if (res.data.success) {
        setCertificates(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load certificates', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, domainFilter, showToast]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const handleDownloadPdf = async (certificateId) => {
    try {
      setDownloadingId(certificateId);
      const response = await api.get(`/certificates/${certificateId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Certificate_${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast(`Certificate ${certificateId} PDF downloaded.`, 'success');
    } catch (err) {
      showToast(err.message || 'Download failed', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleIssue = async (certificateId) => {
    try {
      const res = await api.post(`/certificates/${certificateId}/issue`);
      if (res.data.success) {
        showToast(`Certificate ${certificateId} officially issued!`, 'success');
        loadCertificates();
      }
    } catch (err) {
      showToast(err.message || 'Issue failed', 'error');
    }
  };

  const handleRevokeConfirm = async (reason) => {
    if (!revokeTarget) return;
    try {
      const res = await api.post(`/certificates/${revokeTarget}/revoke`, { reason });
      if (res.data.success) {
        showToast(`Certificate ${revokeTarget} revoked.`, 'info');
        loadCertificates();
      }
    } catch (err) {
      showToast(err.message || 'Revocation failed', 'error');
      throw err;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-serif">
            Certificate Management Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, issue, revoke, and export 45 Days Industrial Training credentials.
          </p>
        </div>

        <Link
          to="/admin/certificates/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-gold-400" />
          <span>Generate New Certificate</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Trainee, Certificate ID, or University..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
            >
              <option value="">All Statuses</option>
              <option value="ISSUED">Issued (Valid)</option>
              <option value="DRAFT">Draft</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>

          {/* Domain Filter */}
          <div className="sm:col-span-3">
            <input
              type="text"
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by Domain..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-premium overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-navy-900 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Fetching registry records...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Certificates Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No records match your active query criteria. Try clearing search filters or generate a new certificate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Certificate ID</th>
                  <th className="py-3.5 px-4">Trainee / College</th>
                  <th className="py-3.5 px-4">Domain & Mode</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => {
                  const isIssued = cert.status === 'ISSUED';
                  const isDraft = cert.status === 'DRAFT';
                  const isRevoked = cert.status === 'REVOKED';

                  return (
                    <tr key={cert.certificateId} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                        <Link
                          to={`/admin/certificates/${cert.certificateId}`}
                          className="hover:underline text-navy-900"
                        >
                          {cert.certificateId}
                        </Link>
                      </td>

                      {/* Trainee & Institution */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{cert.traineeName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{cert.institution}</p>
                      </td>

                      {/* Domain */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{cert.trainingDomain}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{cert.trainingMode || 'Hybrid'} • 45 Days</p>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(cert.issueDate || cert.issuedAt)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={cert.status} size="sm" />
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        
                        {/* View Details */}
                        <Link
                          to={`/admin/certificates/${cert.certificateId}`}
                          title="View Details & Dossier"
                          className="inline-flex items-center p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Public Verification Link */}
                        <Link
                          to={`/verify/${cert.certificateId}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Public Verification Link"
                          className="inline-flex items-center p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Download PDF */}
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(cert.certificateId)}
                          disabled={downloadingId === cert.certificateId}
                          title="Download A4 PDF"
                          className="inline-flex items-center p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                          {downloadingId === cert.certificateId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-navy-800" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Issue Button if Draft */}
                        {isDraft && (
                          <button
                            type="button"
                            onClick={() => handleIssue(cert.certificateId)}
                            title="Issue Certificate Officially"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Issue</span>
                          </button>
                        )}

                        {/* Revoke Button if Issued */}
                        {isIssued && (
                          <button
                            type="button"
                            onClick={() => setRevokeTarget(cert.certificateId)}
                            title="Revoke Certificate with Mandatory Reason"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
                        )}

                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
              <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} records total)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revoke Modal */}
      <RevokeModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        certificateId={revokeTarget}
        onConfirm={handleRevokeConfirm}
      />

    </div>
  );
}
