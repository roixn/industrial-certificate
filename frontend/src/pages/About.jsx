import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Target, Eye, BookOpen, ShieldCheck, CheckCircle2, Building, Mail, Phone } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-16 py-12">
      
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-navy-700" />
            <span>About Nexora Innovations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-950 font-serif leading-tight">
            Setting the Benchmark in High-Integrity Technical Training
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Nexora Innovations Pvt. Ltd. was founded by industry engineering veterans to eliminate the gap between university syllabi and enterprise production engineering. We deliver intensive 45-day industrial internships with mandatory hands-on project deliveries.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-premium flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-navy-900 text-gold-400 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-navy-950 font-serif">Our Mission</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                To empower engineering students with production-grade development practices, modern DevOps discipline, and advanced software architecture while ensuring every credential issued represents verifiable technical merit.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero-compromise project code reviews</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-premium flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500 text-navy-950 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-navy-950 font-serif">Our Vision</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                To be the most trusted industrial training and credential verification standard for employers and universities nationwide, eliminating fraudulent certificate claims through digital cryptographic authenticity.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-navy-700">
              <ShieldCheck className="w-4 h-4 text-navy-700" />
              <span>Real-time central registry integration</span>
            </div>
          </div>

        </div>
      </section>

      {/* Training Standards */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-extrabold text-navy-950 font-serif">
              The 45-Day Curriculum Framework
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every trainee completes an intensive, structured 45 calendar days syllabus broken into three 15-day modules:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-navy-100 text-navy-800">
                Phase 1 (Days 1–15)
              </span>
              <h4 className="text-lg font-bold text-navy-950">Foundational Core & Tooling</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Architecture fundamentals, git collaboration, clean code conventions, test-driven methodologies, and enterprise development environment setup.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gold-100 text-gold-800">
                Phase 2 (Days 16–30)
              </span>
              <h4 className="text-lg font-bold text-navy-950">Advanced Domain Engineering</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specialized domain modules (Cloud Native, GenAI, DevOps, or Embedded systems). Real-time debugging, database optimization, and performance benchmarking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Phase 3 (Days 31–45)
              </span>
              <h4 className="text-lg font-bold text-navy-950">Capstone Project & Evaluation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full-scale capstone deployment, documentation, code review by senior software architects, and comprehensive viva assessment for performance grading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Contact & Integrity Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-premium space-y-4">
            <h3 className="text-xl font-bold text-navy-950 font-serif">Integrity & Accreditation Notice</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nexora Innovations issues certificates solely to students who complete verified training programs under our direct mentorship. We do not manufacture fictitious accreditations or unauthorized government stamps. Authenticity is maintained exclusively through our central database registry and cryptographic QR codes.
            </p>
            <div className="pt-2">
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 text-sm font-bold text-navy-900 hover:text-gold-600"
              >
                <span>Access Central Verification Registry →</span>
              </Link>
            </div>
          </div>

          <div className="bg-navy-950 rounded-3xl p-8 text-white space-y-4">
            <h4 className="text-lg font-bold font-serif text-gold-400">Registrar Office</h4>
            <div className="space-y-3 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <Building className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Tower B, 4th Floor, Logix Cyber Park, Sector 62, Electronic City, Noida, Uttar Pradesh 201309</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>certifications@nexora-tech.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+91 (080) 4567-8900</span>
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
