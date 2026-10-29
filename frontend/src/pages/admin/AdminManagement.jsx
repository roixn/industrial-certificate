import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  KeyRound,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  User,
  Calendar,
  Sparkles,
  X,
  Lock,
} from 'lucide-react';

export default function AdminManagement() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOtpPreview, setInviteOtpPreview] = useState('');
  const [inviteStep, setInviteStep] = useState(1); // 1 = send OTP, 2 = verify & set password
  const [inviteOtp, setInviteOtp] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviting, setInviting] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/admins');
      if (res.data.success) {
        setAdmins(res.data.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load administrator accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleToggleStatus = async (targetId, currentStatus, email) => {
    if (String(user?.id) === String(targetId)) {
      showToast('You cannot deactivate your own account.', 'warning');
      return;
    }

    try {
      const res = await api.patch(`/auth/admins/${targetId}/toggle-status`);
      if (res.data.success) {
        showToast(res.data.message || `Status updated for ${email}`, 'success');
        loadAdmins();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleSendInviteOtp = async (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      setInviting(true);
      const res = await api.post('/auth/request-otp', {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
      });
      if (res.data.success) {
        setInviteOtpPreview(res.data.previewOtp || '');
        setInviteStep(2);
        showToast(`Verification OTP sent for ${inviteEmail}`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to send OTP invite', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleConfirmInvite = async (e) => {
    e.preventDefault();
    if (!inviteOtp || !invitePassword) {
      showToast('Please provide the OTP and password', 'error');
      return;
    }

    try {
      setInviting(true);
      const res = await api.post('/auth/verify-otp-register', {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        otp: inviteOtp.trim(),
        password: invitePassword,
      });

      if (res.data.success) {
        showToast(`New administrator ${inviteEmail} registered successfully!`, 'success');
        setInviteModalOpen(false);
        setInviteName('');
        setInviteEmail('');
        setInviteOtp('');
        setInvitePassword('');
        setInviteOtpPreview('');
        setInviteStep(1);
        loadAdmins();
      }
    } catch (err) {
      showToast(err.message || 'Failed to complete registration', 'error');
    } finally {
      setInviting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never logged in';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-navy-700" />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-serif">
            Administrator Team & Access Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Control which authorized officers can generate, issue, amend, or revoke 45 Days Industrial Training certificates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setInviteStep(1);
            setInviteModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-gold-400" />
          <span>Invite New Admin (OTP Verified)</span>
        </button>
      </div>

      {/* Security Architecture Card */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white p-6 rounded-3xl shadow-premium border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Restricted Administrative Fortress</span>
          </div>
          <h3 className="text-lg font-bold font-serif text-white">
            How Access Security is Guaranteed
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Public users cannot view or manipulate certificates. All administrative endpoints require valid JWT authentication inside secure HTTP-only cookies. Passwords use bcrypt hashing (10 rounds), and every login is rate-limited.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-navy-800/80 px-3.5 py-2 rounded-xl border border-navy-700 font-mono text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Superadmin Guard Active</span>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-premium overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-navy-950 font-serif">
            Registered Administrators ({admins.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Active Accounts: {admins.filter((a) => a.isActive).length}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-navy-900 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading administrative roster...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Administrator</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Last Login</th>
                  <th className="py-3.5 px-5">Registered On</th>
                  <th className="py-3.5 px-5">Access Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((adm) => {
                  const isSelf = String(user?.id) === String(adm._id);
                  const isSuper = adm.role === 'superadmin';

                  return (
                    <tr key={adm._id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name & Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-navy-100 text-navy-900 flex items-center justify-center font-bold text-xs uppercase border border-navy-200">
                            {adm.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{adm.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-slate-500 text-xs">{adm.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isSuper
                              ? 'bg-gold-50 text-gold-900 border-gold-300'
                              : 'bg-navy-50 text-navy-800 border-navy-200'
                          }`}
                        >
                          {adm.role}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-5 text-slate-600">
                        {formatDate(adm.lastLogin)}
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-5 text-slate-500 font-mono">
                        {new Date(adm.createdAt).toLocaleDateString()}
                      </td>

                      {/* Active Status Badge */}
                      <td className="py-4 px-5">
                        {adm.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        {!isSelf ? (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(adm._id, adm.isActive, adm.email)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              adm.isActive
                                ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {adm.isActive ? 'Deactivate' : 'Activate Access'}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Active Session</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Administrator Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-navy-100 text-navy-900">
                  <UserPlus className="w-5 h-5 text-navy-800" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-serif">
                    Invite New Administrator
                  </h3>
                  <p className="text-xs text-slate-500">6-Digit OTP Verification Workflow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Step 1: Send OTP */}
              {inviteStep === 1 && (
                <form onSubmit={handleSendInviteOtp} className="space-y-4 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    Provide the staff member's official details. A one-time 6-digit code will be generated to activate their administrative role.
                  </p>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="ramesh.kumar@company.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviting}
                      className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {inviting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                          <span>Generating OTP...</span>
                        </>
                      ) : (
                        <span>Generate & Send OTP</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Confirm OTP & Password */}
              {inviteStep === 2 && (
                <form onSubmit={handleConfirmInvite} className="space-y-4 text-xs">
                  {inviteOtpPreview && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>OTP Dispatched for {inviteEmail}</span>
                      </div>
                      <p className="font-mono text-base font-black text-emerald-900">
                        Code: {inviteOtpPreview}
                      </p>
                      <p className="text-[10px] text-emerald-700">Valid for 10 minutes</p>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={inviteOtp}
                      onChange={(e) => setInviteOtp(e.target.value)}
                      placeholder="e.g. 592810"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Set Password (Min 8 Characters)
                    </label>
                    <input
                      type="password"
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      minLength={8}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setInviteStep(1)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={inviting}
                      className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {inviting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                          <span>Activating Account...</span>
                        </>
                      ) : (
                        <span>Activate Administrator</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
