import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import CertificatePreview from '../../components/CertificatePreview';
import confetti from 'canvas-confetti';
import {
  FilePlus,
  Calendar,
  Sparkles,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const formSchema = z.object({
  traineeName: z.string().min(2, 'Trainee full name must be at least 2 characters').max(120),
  fatherName: z.string().max(120).optional(),
  institution: z.string().min(2, 'Institution / College is required').max(200),
  degree: z.string().min(2, 'Degree/Course is required').max(100),
  branch: z.string().min(2, 'Branch/Specialization is required').max(100),
  enrollmentNumber: z.string().max(80).optional(),
  trainingDomain: z.string().min(2, 'Training domain is required').max(150),
  trainingStartDate: z.string().min(1, 'Start date is required'),
  trainingEndDate: z.string().min(1, 'Completion date is required'),
  trainingMode: z.enum(['Online', 'Offline', 'Hybrid']),
  performanceGrade: z.string().max(50).optional(),
  remarks: z.string().max(500).optional(),
});

export default function CertificateCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);
  const [previewTab, setPreviewTab] = useState(false);

  // Default start date = 45 days ago, end date = yesterday
  const defaultStartDate = new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultEndDate = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingMode: 'Hybrid',
      performanceGrade: 'Distinction (A+)',
      trainingStartDate: defaultStartDate,
      trainingEndDate: defaultEndDate,
      trainingDomain: 'Full Stack Cloud Native Web Architecture',
    },
  });

  const formValues = watch();

  // Load company settings snapshot
  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await api.get('/company');
        if (res.data.success) {
          setCompanySettings(res.data.data);
        }
      } catch (e) {
        console.error('Failed to load company settings', e);
      }
    }
    loadCompany();
  }, []);

  // Compute calculated duration days live
  const calculateDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const s = new Date(startStr);
    const e = new Date(endStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const startUtc = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
    const endUtc = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
    if (endUtc < startUtc) return -1;
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((endUtc - startUtc) / msPerDay) + 1; // Inclusive
  };

  const currentSpanDays = calculateDays(formValues.trainingStartDate, formValues.trainingEndDate);
  const is45Days = currentSpanDays === 45;

  // Auto-set 45 days helper
  const handleAutoFill45Days = () => {
    if (!formValues.trainingStartDate) return;
    const start = new Date(formValues.trainingStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 44); // 45 days inclusive
    setValue('trainingEndDate', end.toISOString().split('T')[0]);
    showToast('Completion date synchronized to exact 45 days duration.', 'info');
  };

  const onSubmit = async (data, issueImmediately = false) => {
    if (!is45Days) {
      showToast(`Dates currently span ${currentSpanDays} day(s). Exactly 45 days are required.`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...data,
        issueImmediately,
      };

      const res = await api.post('/certificates', payload);
      if (res.data.success && res.data.data) {
        const cert = res.data.data;
        if (issueImmediately) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          showToast(`Certificate ${cert.certificateId} issued successfully!`, 'success');
        } else {
          showToast(`Draft certificate ${cert.certificateId} saved.`, 'success');
        }
        navigate(`/admin/certificates/${cert.certificateId}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create certificate', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Construct temporary preview object
  const previewCert = {
    certificateId: 'CERT-2026-PREVIEW',
    traineeName: formValues.traineeName || 'Trainee Full Name',
    institution: formValues.institution || 'College / University Name',
    degree: formValues.degree || 'Bachelor of Technology',
    branch: formValues.branch || 'Computer Science & Engineering',
    enrollmentNumber: formValues.enrollmentNumber || 'ENR12345678',
    trainingDomain: formValues.trainingDomain || 'Advanced Cloud Software Engineering',
    trainingStartDate: formValues.trainingStartDate,
    trainingEndDate: formValues.trainingEndDate,
    durationDays: 45,
    trainingMode: formValues.trainingMode,
    performanceGrade: formValues.performanceGrade,
    signatoryName: companySettings?.authorizedSignatory || 'Dr. Rajesh K. Sharma',
    signatoryDesignation: companySettings?.signatoryDesignation || 'Director of Technical Training',
    companySnapshot: {
      name: companySettings?.companyName || 'Nexora Innovations Pvt. Ltd.',
      tagline: companySettings?.companyTagline || 'Center for Advanced Industrial Training & Engineering Excellence',
    },
    qrVerificationUrl: `${window.location.origin}/verify/CERT-2026-PREVIEW`,
    issueDate: new Date(),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold uppercase tracking-wider mb-2">
            <FilePlus className="w-3.5 h-3.5 text-navy-700" />
            <span>Official Credential Issuance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-serif">
            Generate 45 Days Industrial Training Certificate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Fill the verified trainee details. The system strictly enforces the 45-day duration and generates unique QR codes.
          </p>
        </div>

        {/* Mobile Preview Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setPreviewTab(!previewTab)}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-navy-700" />
            <span>{previewTab ? 'Return to Form' : 'Inspect Live Preview'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Form (7 cols) + Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container */}
        <div className={`lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-premium space-y-6 ${previewTab ? 'hidden lg:block' : 'block'}`}>
          
          <form className="space-y-6">
            
            {/* 1. Trainee Details */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-navy-950 font-serif border-b border-slate-100 pb-2">
                1. Trainee Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Trainee Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('traineeName')}
                    placeholder="e.g. Aarav Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  />
                  {errors.traineeName && <p className="text-xs text-rose-500 mt-1">{errors.traineeName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Father's Name (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('fatherName')}
                    placeholder="e.g. Vikram Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Student Enrollment No (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('enrollmentNumber')}
                    placeholder="e.g. 21BCE1042"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  College / University Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('institution')}
                  placeholder="e.g. National Institute of Technology, Karnataka"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                />
                {errors.institution && <p className="text-xs text-rose-500 mt-1">{errors.institution.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Course / Degree <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('degree')}
                    placeholder="e.g. Bachelor of Technology"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  />
                  {errors.degree && <p className="text-xs text-rose-500 mt-1">{errors.degree.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Branch / Specialization <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('branch')}
                    placeholder="e.g. Computer Science and Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  />
                  {errors.branch && <p className="text-xs text-rose-500 mt-1">{errors.branch.message}</p>}
                </div>
              </div>
            </div>

            {/* 2. Training Domain & 45 Days Duration */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-navy-950 font-serif border-b border-slate-100 pb-2">
                2. Training Domain & 45-Day Period
              </h3>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Technical Training Domain <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('trainingDomain')}
                  placeholder="e.g. Full Stack Cloud Native Web Architecture"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm font-medium"
                />
                {errors.trainingDomain && <p className="text-xs text-rose-500 mt-1">{errors.trainingDomain.message}</p>}
              </div>

              {/* Date Pickers & Auto 45-day calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('trainingStartDate')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  />
                  {errors.trainingStartDate && <p className="text-xs text-rose-500 mt-1">{errors.trainingStartDate.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Completion Date <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoFill45Days}
                      className="text-[11px] font-bold text-navy-700 hover:text-gold-600 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-gold-500" />
                      <span>Set Exact 45 Days</span>
                    </button>
                  </div>
                  <input
                    type="date"
                    {...register('trainingEndDate')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  />
                  {errors.trainingEndDate && <p className="text-xs text-rose-500 mt-1">{errors.trainingEndDate.message}</p>}
                </div>
              </div>

              {/* Duration Live Validation Indicator */}
              <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                is45Days
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : currentSpanDays < 0
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-center gap-2">
                  {is45Days ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>
                    {is45Days
                      ? 'Duration Verified: Exactly 45 Calendar Days (Inclusive Policy)'
                      : currentSpanDays < 0
                      ? 'Error: Completion date cannot be earlier than start date.'
                      : `Current selection: ${currentSpanDays} day(s). System requires exactly 45 days.`}
                  </span>
                </div>
                {!is45Days && (
                  <button
                    type="button"
                    onClick={handleAutoFill45Days}
                    className="font-bold underline text-[11px] shrink-0 ml-2"
                  >
                    Fix to 45 Days
                  </button>
                )}
              </div>

              {/* Mode & Performance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Training Mode
                  </label>
                  <select
                    {...register('trainingMode')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm bg-white"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Performance Grade
                  </label>
                  <input
                    type="text"
                    {...register('performanceGrade')}
                    placeholder="e.g. Distinction (A+)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Supervisor Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  {...register('remarks')}
                  placeholder="e.g. Demonstrates strong software architecture skills and clean code discipline."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                />
              </div>

            </div>

            {/* Submit Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting || !is45Days}
                onClick={handleSubmit((data) => onSubmit(data, false))}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                disabled={submitting || !is45Days}
                onClick={handleSubmit((data) => onSubmit(data, true))}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs tracking-wide shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                    <span>Processing Registry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-gold-400" />
                    <span>Issue Certificate Immediately</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Live Preview Container (5 cols) */}
        <div className={`lg:col-span-5 space-y-4 ${previewTab ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-slate-100/80 rounded-3xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-navy-800" />
                <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                  Live Certificate Document
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold-100 text-gold-900 font-bold">
                REAL-TIME
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[380px]">
                <CertificatePreview cert={previewCert} showActions={false} />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              <span>Preview updates automatically as you type student and curriculum data.</span>
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
