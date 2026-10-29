import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { Settings, Building, Save, CheckCircle2, Globe, ShieldCheck, Mail, Phone, MapPin, User, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const settingsSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  companyTagline: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone number is required'),
  website: z.string().url('Must be a valid URL (including https://)'),
  authorizedSignatory: z.string().min(2, 'Signatory name is required'),
  signatoryDesignation: z.string().min(2, 'Signatory designation is required'),
  certificatePrefix: z.string().min(2).max(8).toUpperCase(),
  verificationDomain: z.string().url('Must be a valid verification domain URL'),
  allowPublicDownload: z.boolean(),
  countingPolicy: z.enum(['INCLUSIVE', 'EXCLUSIVE']),
});

export default function CompanySettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get('/company');
        if (res.data.success && res.data.data) {
          reset(res.data.data);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load company settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [reset, showToast]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const res = await api.patch('/company', data);
      if (res.data.success) {
        showToast('Company settings & certificate branding updated successfully!', 'success');
        reset(res.data.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
        <p className="text-sm text-slate-500 font-medium">Loading organization configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5 text-navy-700" />
          <span>Branding & Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-serif">
          Company Settings & Certificate Authority
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure issuing company branding, authorized signatory details, and verification domains embedded in QR codes and PDFs.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* 1. Entity Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-premium space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-navy-800" />
            <h3 className="text-base font-bold text-navy-950 font-serif">
              Issuing Organization Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Company Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('companyName')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm font-semibold"
              />
              {errors.companyName && <p className="text-xs text-rose-500 mt-1">{errors.companyName.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Company Subtitle / Tagline
              </label>
              <input
                type="text"
                {...register('companyTagline')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Registered Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('address')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
              />
              {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Official Certification Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Office Telephone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('phone')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Official Website URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                {...register('website')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
              />
              {errors.website && <p className="text-xs text-rose-500 mt-1">{errors.website.message}</p>}
            </div>
          </div>
        </div>

        {/* 2. Signatory & Authority */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-premium space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-navy-800" />
            <h3 className="text-base font-bold text-navy-950 font-serif">
              Authorized Signatory Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Signatory Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('authorizedSignatory')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm font-semibold"
              />
              {errors.authorizedSignatory && (
                <p className="text-xs text-rose-500 mt-1">{errors.authorizedSignatory.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Official Designation / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('signatoryDesignation')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
              />
              {errors.signatoryDesignation && (
                <p className="text-xs text-rose-500 mt-1">{errors.signatoryDesignation.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Certificate Registry & QR Parameters */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-premium space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-navy-800" />
            <h3 className="text-base font-bold text-navy-950 font-serif">
              Registry & Verification Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Certificate ID Prefix
              </label>
              <input
                type="text"
                {...register('certificatePrefix')}
                maxLength={8}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm font-mono uppercase font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">e.g. CERT generates CERT-2026-0001</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Duration Counting Policy
              </label>
              <select
                {...register('countingPolicy')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm bg-white"
              >
                <option value="INCLUSIVE">Inclusive (Start day + End day = 45 days)</option>
                <option value="EXCLUSIVE">Exclusive (End day minus Start day = 45 days)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Base QR Verification Domain URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                {...register('verificationDomain')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Target domain encoded into QR codes (e.g. https://yourdomain.com/verify)
              </p>
              {errors.verificationDomain && (
                <p className="text-xs text-rose-500 mt-1">{errors.verificationDomain.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('allowPublicDownload')}
                  className="w-4 h-4 rounded text-navy-900 focus:ring-navy-900 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-700">
                  Allow public visitors and recruiters to download official PDF certificates directly from the verification page
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-sm tracking-wide shadow-md transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-gold-400" />
                <span>Save Company Configuration</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
