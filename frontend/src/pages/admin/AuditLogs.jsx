import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, Search, Filter, Loader2, ChevronLeft, ChevronRight, User, Calendar, Terminal } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AuditLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [certFilter, setCertFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          limit: '15',
        });
        if (actionFilter) params.append('action', actionFilter);
        if (certFilter) params.append('certificateId', certFilter);

        const res = await api.get(`/audit-logs?${params.toString()}`);
        if (res.data.success) {
          setLogs(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load audit logs', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [page, actionFilter, certFilter, showToast]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
  };

  const getActionColor = (action) => {
    if (action.includes('REVOKE')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (action.includes('ISSUE')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('AMEND') || action.includes('UPDATE')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (action.includes('LOGIN')) return 'bg-navy-100 text-navy-800 border-navy-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-navy-700" />
          <span>Immutable Ledger</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-serif">
          Administrative Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Permanent chronological log of all certificate issuances, revocations, amendments, and administrator activities.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={certFilter}
              onChange={(e) => {
                setCertFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by Certificate ID (e.g. CERT-2026-0001)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono"
            />
          </div>

          <div className="sm:col-span-6">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
            >
              <option value="">All Action Types</option>
              <option value="CERTIFICATE_ISSUED">Certificate Issued</option>
              <option value="CERTIFICATE_REVOKED">Certificate Revoked</option>
              <option value="CERTIFICATE_AMENDED">Certificate Amended</option>
              <option value="CERTIFICATE_CREATED_DRAFT">Draft Created</option>
              <option value="COMPANY_SETTINGS_UPDATED">Company Settings Updated</option>
              <option value="ADMIN_LOGIN">Admin Login</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-premium overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-navy-900 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Retrieving audit log entries...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No audit log entries matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Certificate ID</th>
                  <th className="py-3.5 px-4">Performed By</th>
                  <th className="py-3.5 px-4">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {formatDate(log.createdAt || log.timestamp)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[10px] border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                      {log.certificateId || '—'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{log.performedBy?.name || 'Administrator'}</p>
                      <p className="text-[10px] text-slate-400">{log.performedBy?.email}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      <p className="leading-relaxed">{log.reason || 'Operation recorded'}</p>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
              <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} entries)
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

    </div>
  );
}
