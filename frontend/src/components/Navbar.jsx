import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, LogOut, Menu, X, LayoutDashboard, FileText, Settings, ShieldAlert, Users, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import QrScannerModal from './QrScannerModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('You have been safely signed out.', 'info');
      navigate('/admin/login');
    } catch (err) {
      showToast('Error during logout', 'error');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Verify Certificate', path: '/verify' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Certificates', path: '/admin/certificates', icon: FileText },
    { name: 'Branding & Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { name: 'Team & Admins', path: '/admin/admins', icon: Users },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-navy-950 via-navy-900 to-navy-700 flex items-center justify-center text-white shadow-md shadow-navy-900/10 group-hover:scale-105 transition-transform duration-200 border border-navy-800">
              <Award className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-navy-950">NEXORA</span>
                <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-gold-100 text-gold-800 border border-gold-300">
                  REGISTRY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Industrial Training & Credential Verification</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-navy-900 bg-navy-50 font-semibold'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Admin / CTA controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Scan QR Button */}
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-50 hover:bg-gold-50 text-navy-950 hover:text-gold-900 border border-navy-200 hover:border-gold-300 text-xs font-bold transition-all shadow-sm"
              title="Scan certificate QR code with camera or upload image"
            >
              <QrCode className="w-4 h-4 text-gold-600" />
              <span>Scan QR Code</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-gold-400" />
                  <span>Admin Console</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/verify"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-navy-900 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Search ID</span>
                </Link>
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 shadow-sm transition-all"
                >
                  <span>Portal Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-navy-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive(link.path) ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {/* Mobile Scan Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setScannerOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gold-50 text-gold-950 border border-gold-300 font-bold text-sm shadow-sm"
            >
              <QrCode className="w-4 h-4 text-gold-600" />
              <span>Scan Certificate QR Code</span>
            </button>

            {isAuthenticated ? (
              <>
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Admin Control Panel
                </div>
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-navy-900 hover:bg-navy-50"
                    >
                      <Icon className="w-4 h-4 text-navy-700" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 px-4 rounded-lg bg-navy-900 text-white font-semibold text-sm"
              >
                Admin Portal Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Interactive QR Code Scanner Modal */}
      <QrScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </header>
  );
}
