import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Calendar,
  Activity,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.get('/certificates/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load dashboard metrics', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [showToast]);

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
        <p className="text-sm text-slate-500 font-medium">Aggregating registry statistics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-serif">
            Registry Overview & Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live database counts for 45 Days Industrial Training certificates and verification audits.
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

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatsCard
          title="Total Certificates"
          value={stats?.totalCertificates ?? 0}
          subtitle="All records in database"
          icon={FileText}
          color="navy"
        />
        <StatsCard
          title="Issued This Month"
          value={stats?.issuedThisMonth ?? 0}
          subtitle="Recent 30 days throughput"
          icon={Calendar}
          color="gold"
        />
        <StatsCard
          title="Active Valid"
          value={stats?.activeCertificates ?? 0}
          subtitle="Officially issued & verified"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Revoked Credentials"
          value={stats?.revokedCertificates ?? 0}
          subtitle="Flagged by authority"
          icon={XCircle}
          color="rose"
        />
        <StatsCard
          title="Training Domains"
          value={stats?.totalDomains ?? 0}
          subtitle="Technical specializations"
          icon={Layers}
          color="navy"
        />
      </div>

      {/* Two Column Layout: Recent Certificates & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Recent Certificates Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-premium space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">Recent Certificate Activity</h3>
              <p className="text-xs text-slate-500">Latest records generated and managed</p>
            </div>
            <Link
              to="/admin/certificates"
              className="text-xs font-bold text-navy-800 hover:text-navy-600 flex items-center gap-1"
            >
              <span>View All Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Certificate ID</th>
                  <th className="py-3 px-3">Trainee Name</th>
                  <th className="py-3 px-3">Domain</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentCertificates?.length > 0 ? (
                  stats.recentCertificates.map((cert) => (
                    <tr key={cert.certificateId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-navy-950">
                        {cert.certificateId}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {cert.traineeName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[160px]">
                        {cert.trainingDomain}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={cert.status} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          to={`/admin/certificates/${cert.certificateId}`}
                          className="font-bold text-navy-800 hover:text-gold-600 inline-flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No certificates issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Live Audit Trail & Quick Domain Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Domain Breakdown Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-premium space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-navy-950">
              Domain Distribution
            </h4>
            <div className="space-y-2.5">
              {stats?.domainCounts?.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate max-w-[190px] font-medium" title={d._id}>
                    {d._id || 'Unspecified'}
                  </span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Log Feed */}
          <div className="bg-navy-950 text-white rounded-3xl p-6 shadow-premium space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-gold-400" />
                <h4 className="text-sm font-bold font-serif text-white">Live Audit Feed</h4>
              </div>
              <Link to="/admin/audit-logs" className="text-[11px] text-gold-400 hover:underline">
                Full Log
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.recentAuditLogs?.slice(0, 4).map((log, idx) => (
                <div key={idx} className="text-xs space-y-0.5 border-b border-navy-900 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gold-300 font-bold">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] truncate">
                    {log.reason || 'Audit event logged'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    By: {log.performedBy?.name || 'Administrator'}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
