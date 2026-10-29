import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-800/80">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-800 to-navy-700 flex items-center justify-center text-white border border-navy-600">
                <Award className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">NEXORA</span>
                <span className="ml-1.5 text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400 border border-gold-400/30">
                  REGISTRY
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Official verification registry and management system for 45 Days Industrial Training Credentials, authorized certifications, and technical internships.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400/90 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real-time Cryptographic QR Verification</span>
            </div>
          </div>

          {/* Verification Portal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Verification Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/verify" className="hover:text-gold-400 transition-colors">
                  Instant Certificate Lookup
                </Link>
              </li>
              <li>
                <Link to="/verify/CERT-2026-0001" className="hover:text-gold-400 transition-colors">
                  Sample Valid Credential Demo
                </Link>
              </li>
              <li>
                <Link to="/verify/CERT-2026-0003" className="hover:text-gold-400 transition-colors">
                  Sample Revoked Credential Demo
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-400">Strict 45-day curriculum verification registry</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Organization</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">
                  About Our Training Programs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors">
                  Contact Registrar Office
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-gold-400 transition-colors">
                  Authorized Administrator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Official Office</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Tower B, 4th Floor, Logix Cyber Park, Sector 62, Electronic City, Noida, Uttar Pradesh 201309</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a href="mailto:certifications@nexora-tech.com" className="hover:text-white transition-colors">
                  certifications@nexora-tech.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+91 (080) 4567-8900</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()} Nexora Innovations Pvt. Ltd. All rights reserved. Industrial Training & Certification Division.
          </p>
          <div className="flex items-center gap-6">
            <span>Official 45-Day Certification Standard</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span>Tamper-Resistant Digital Audit Registry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
