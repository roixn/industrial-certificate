import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QrScannerModal from '../components/QrScannerModal';
import {
  ShieldCheck,
  Search,
  Award,
  CheckCircle2,
  QrCode,
  FileCheck,
  Database,
  ArrowRight,
  Code,
  Cpu,
  Brain,
  Cloud,
  Terminal,
  Lock,
  Building2,
  Users,
  Camera,
} from 'lucide-react';

export default function Home() {
  const [certInput, setCertInput] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (certInput.trim()) {
      navigate(`/verify/${certInput.trim().toUpperCase()}`);
    }
  };

  const programs = [
    {
      title: 'Full Stack Cloud Native Web Architecture',
      description: 'Microservices, Node.js, React, Distributed Caching, and Enterprise REST API design.',
      icon: Code,
      duration: '45 Days Intensive',
    },
    {
      title: 'Applied Generative AI & Deep Learning Systems',
      description: 'LLM fine-tuning, RAG pipelines, PyTorch neural networks, and computer vision deployment.',
      icon: Brain,
      duration: '45 Days Intensive',
    },
    {
      title: 'DevOps & Kubernetes Cloud Infrastructure',
      description: 'CI/CD automation, Docker orchestration, Terraform IaC, AWS/GCP cloud architectures.',
      icon: Cloud,
      duration: '45 Days Intensive',
    },
    {
      title: 'Cybersecurity & Practical Penetration Testing',
      description: 'Vulnerability assessments, network defense, SOC operations, and threat hunting.',
      icon: Lock,
      duration: '45 Days Intensive',
    },
    {
      title: 'Embedded IoT & Edge AI Firmware Development',
      description: 'ARM Cortex programming, FreeRTOS, edge inference, and hardware-software co-design.',
      icon: Cpu,
      duration: '45 Days Intensive',
    },
    {
      title: 'Data Science & Predictive Engineering Analytics',
      description: 'Statistical modeling, high-throughput ETL pipelines, Apache Spark, and business intelligence.',
      icon: Terminal,
      duration: '45 Days Intensive',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Rigorous 45-Day Training',
      description: 'Students complete 45 calendar days of hands-on industrial capstones, evaluations, and supervisor reviews.',
      icon: Award,
    },
    {
      number: '02',
      title: 'Cryptographic QR Issuance',
      description: 'Upon verification, the portal automatically mints a unique Certificate ID and embeds a secure QR code into an A4 PDF.',
      icon: QrCode,
    },
    {
      number: '03',
      title: 'Real-Time Employer Verification',
      description: 'Recruiters and universities scan the QR code to instantly inspect authentic records from our central registry.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-navy-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Header pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-800/80 border border-gold-500/30 text-xs font-semibold text-gold-300 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official 45 Days Industrial Training Registry</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-serif leading-[1.15]">
              Industrial Training Certificate{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-200">
                Verification Portal
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Nexora Innovations provides industry-aligned 45-day technical engineering training. Every credential issued is cryptographically stamped with a tamper-evident QR code and verified in real-time.
            </p>

            {/* Instant Verification Search Bar */}
            <form onSubmit={handleSearch} className="pt-2 max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl focus-within:border-gold-400/80 transition-all">
                <div className="flex items-center gap-2.5 px-3.5 py-2 w-full text-slate-300">
                  <Search className="w-5 h-5 text-gold-400 shrink-0" />
                  <input
                    type="text"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="Enter Certificate ID (e.g. CERT-2026-0001)"
                    className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none uppercase font-mono tracking-wider font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Now</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2.5">
                Try demo records: <Link to="/verify/CERT-2026-0001" className="text-gold-300 underline font-mono">CERT-2026-0001</Link> (Valid) or <Link to="/verify/CERT-2026-0003" className="text-gold-300 underline font-mono">CERT-2026-0003</Link> (Revoked)
              </p>
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-sm shadow-lg hover:shadow-gold-500/20 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-navy-950" />
                <span>Scan Certificate QR Code</span>
              </button>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-navy-950 font-bold text-sm shadow-md hover:bg-slate-100 transition-all"
              >
                <span>Verify by Certificate ID</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-navy-800/80 hover:bg-navy-800 text-white font-semibold text-sm border border-navy-700 transition-all"
              >
                <span>Explore Training Programs</span>
              </Link>
            </div>

          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-10 border-t border-navy-800/80 text-center">
            <div>
              <p className="text-3xl font-extrabold text-gold-400 font-serif">45 Days</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Mandatory Duration</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white font-serif">100%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">QR Verified Records</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gold-400 font-serif">12,500+</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Trainees Certified</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white font-serif">250+</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Colleges & Universities</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Company Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-navy-700" />
              <span>Center of Engineering Excellence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-serif leading-tight">
              Bridging Academic Theory with Real-World Industrial Practice
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Nexora Innovations conducts intensive 45-day industrial training modules designed in partnership with technology leaders. We equip undergraduate and graduate engineering students with production-level skills in cloud infrastructure, AI architecture, cybersecurity, and embedded firmware.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              Every trainee submits capstone software builds, undertakes rigorous weekly performance reviews, and earns a verifiable credential backed by our centralized cryptographic registry.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Strict Date Validation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Certificates strictly comply with the configured 45-day duration policy.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Zero Silent Tampering</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Every amendment or revocation is logged in permanent audit trails.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-tr from-navy-900 to-navy-800 rounded-3xl p-8 text-white shadow-premium-lg border border-navy-700 relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-navy-700 pb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-gold-400">Institutional Registry</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  ONLINE 24/7
                </span>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold font-serif text-white">Trust & Authenticity Guarantee</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Companies and graduate institutions can independently verify any credential with zero friction. Scan the physical or digital QR code to access authenticated student performance and authorized signatory stamps.
                </p>
              </div>

              <div className="bg-navy-950/60 rounded-xl p-4 border border-navy-700/60 font-mono text-xs text-slate-300 space-y-1">
                <div className="text-emerald-400 font-bold">✓ Central Verification Endpoint</div>
                <div className="text-slate-400">ID Format: CERT-{new Date().getFullYear()}-XXXX</div>
                <div className="text-slate-400">Signature: Digitally Signed by Director</div>
              </div>

              <Link
                to="/verify"
                className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Go to Central Verification Desk</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Training Program Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-gold-700" />
            <span>Industrial Curricula</span>
          </div>
          <h2 className="text-3xl font-extrabold text-navy-950 font-serif">
            Technical Domains & Specializations
          </h2>
          <p className="text-sm text-slate-600">
            Engineered to fulfill university industrial internship requirements while building production capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog, idx) => {
            const Icon = prog.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center group-hover:bg-navy-900 group-hover:text-gold-400 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-950 leading-snug">{prog.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{prog.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{prog.duration}</span>
                  <span className="text-navy-700 group-hover:text-gold-600 flex items-center gap-1 font-bold">
                    Official Track →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Verification Process */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-navy-700" />
              <span>3-Step Integrity Engine</span>
            </div>
            <h2 className="text-3xl font-extrabold text-navy-950 font-serif">
              How Our Verification Works
            </h2>
            <p className="text-sm text-slate-600">
              Zero reliance on paper claims. Every physical and digital certificate connects directly to database truth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.number}
                  className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm relative flex flex-col items-start"
                >
                  <span className="text-4xl font-extrabold text-slate-200 font-serif mb-4">{st.number}</span>
                  <div className="p-3 rounded-xl bg-navy-900 text-gold-400 mb-4 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-950 mb-2">{st.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{st.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Contact CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-premium-lg border border-navy-800">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif">
            Require Institutional Verification or Bulk Certification Inquiries?
          </h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto">
            Our registrar office works directly with universities, college placement directors, and employer HR teams to provide authenticated validation rosters.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-sm shadow-md transition-all"
            >
              Contact Registrar Office
            </Link>
            <Link
              to="/verify"
              className="px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-semibold text-sm border border-navy-700 transition-all"
            >
              Verify Certificate ID
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive QR Code Scanner Modal */}
      <QrScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}
