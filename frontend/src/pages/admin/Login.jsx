import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  Award,
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  Loader2,
  KeyRound,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register OTP form state
  const [regStep, setRegStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [generatedOtpPreview, setGeneratedOtpPreview] = useState('');
  const [sentToEmail, setSentToEmail] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      showToast('Welcome back, Administrator.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify administrative credentials.');
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      setOtpLoading(true);
      setError('');
      const res = await api.post('/auth/request-otp', {
        name: regName.trim(),
        email: regEmail.trim(),
      });
      if (res.data.success) {
        setSentToEmail(Boolean(res.data.sentToEmail));
        setGeneratedOtpPreview(res.data.previewOtp || '');
        setRegStep(2);
        showToast(res.data.message || 'Verification OTP generated!', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
      showToast(err.message || 'OTP generation failed', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP & Activate
  const handleVerifyOtpRegister = async (e) => {
    e.preventDefault();
    if (!regOtp || !regPassword) {
      showToast('OTP and password are required', 'error');
      return;
    }

    try {
      setOtpLoading(true);
      setError('');
      const res = await api.post('/auth/verify-otp-register', {
        name: regName.trim(),
        email: regEmail.trim(),
        otp: regOtp.trim(),
        password: regPassword,
      });

      if (res.data.success) {
        showToast('Admin account activated successfully! Logging in...', 'success');
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setOtpLoading(false);
    }
  };



  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-premium-lg">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-navy-950 text-gold-400 flex items-center justify-center mx-auto shadow-md">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-navy-950 font-serif">
            Administrator Gateway
          </h2>
          <p className="text-xs text-slate-500">
            Authorized Certificate Issuance & Verification Authority
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'login' ? 'bg-white text-navy-950 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'register' ? 'bg-white text-navy-950 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Register via OTP
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {tab === 'login' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Security Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="leading-relaxed">
                <span className="font-semibold text-slate-800">Authorized personnel only.</span> All administrative access attempts are monitored and logged.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nexora-tech.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="w-4 h-4 text-gold-400" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: REGISTER VIA OTP */}
        {tab === 'register' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Step 1: Request OTP */}
            {regStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-navy-50 border border-navy-100 text-xs text-navy-800 leading-relaxed">
                  Enter your full name and official company email. We will generate a secure 6-digit verification OTP to activate your account.
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Neha Verma"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="neha.verma@company.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-3 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                      <span>Generating OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate 6-Digit OTP</span>
                      <ArrowRight className="w-4 h-4 text-gold-400" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Enter OTP & Set Password */}
            {regStep === 2 && (
              <form onSubmit={handleVerifyOtpRegister} className="space-y-4">
                
                {/* OTP Delivery Status Banner */}
                {sentToEmail ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>OTP Dispatched to Gmail</span>
                    </div>
                    <p className="text-[11px] text-slate-700">
                      We sent your 6-digit verification code directly to <strong>{regEmail}</strong>. Please check your inbox (and Spam/Junk folder).
                    </p>
                    <p className="text-[10px] text-slate-500">Valid for 10 minutes</p>
                  </div>
                ) : generatedOtpPreview ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Demo Mode: Real SMTP Not Configured</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      To receive codes directly in your real Gmail, configure <code>SMTP_USER</code> and <code>SMTP_PASS</code> in <code>backend/.env</code>.
                    </p>
                    <div className="p-2 rounded-xl bg-white border border-amber-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Use This Generated Code:</span>
                      <span className="font-mono text-base font-black text-navy-950 tracking-widest">{generatedOtpPreview}</span>
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Enter 6-Digit Verification OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={regOtp}
                    onChange={(e) => setRegOtp(e.target.value)}
                    placeholder="e.g. 482910"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-center font-mono font-bold tracking-widest text-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Set Secret Password (Min 8 Characters)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="flex-1 py-3 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate Admin Account</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* Security Notice */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-Guarded • Bcrypt Hashed • Rate-Limited</span>
        </div>

      </div>
    </div>
  );
}
