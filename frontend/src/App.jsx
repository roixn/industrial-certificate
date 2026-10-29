import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Verify from './pages/Verify';
import Contact from './pages/Contact';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CertificateList from './pages/admin/CertificateList';
import CertificateCreate from './pages/admin/CertificateCreate';
import CertificateDetails from './pages/admin/CertificateDetails';
import CompanySettings from './pages/admin/CompanySettings';
import AuditLogs from './pages/admin/AuditLogs';
import AdminManagement from './pages/admin/AdminManagement';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 selection:bg-gold-500 selection:text-navy-950">
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                {/* Public Website */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/verify/:certificateId" element={<Verify />} />
                <Route path="/credentials/:certificateId" element={<Verify />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Admin Auth */}
                <Route path="/admin/login" element={<Login />} />

                {/* Protected Admin Console */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/certificates"
                  element={
                    <ProtectedRoute>
                      <CertificateList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/certificates/new"
                  element={
                    <ProtectedRoute>
                      <CertificateCreate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/certificates/:certificateId"
                  element={
                    <ProtectedRoute>
                      <CertificateDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <CompanySettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute>
                      <AuditLogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/admins"
                  element={
                    <ProtectedRoute>
                      <AdminManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Redirect shortcuts */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                {/* 404 Catch-All */}
                <Route
                  path="*"
                  element={
                    <div className="max-w-md mx-auto py-24 text-center space-y-4">
                      <h2 className="text-4xl font-black text-navy-950 font-serif">404</h2>
                      <p className="text-sm text-slate-600">The requested page does not exist.</p>
                      <a href="/" className="inline-block text-xs font-bold text-navy-900 underline">
                        Return to Homepage
                      </a>
                    </div>
                  }
                />
              </Routes>
            </main>

            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
