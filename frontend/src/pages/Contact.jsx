import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { Mail, Phone, MapPin, Send, CheckCircle2, Building, Clock, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export default function Contact() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const res = await api.post('/public/contact', data);
      if (res.data.success) {
        setSubmitted(true);
        reset();
        showToast('Your message has been received. Our team will contact you shortly.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold uppercase tracking-wider">
          <Building className="w-4 h-4 text-navy-700" />
          <span>Registrar Inquiries</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-serif">
          Contact Training & Certification Division
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Have an institutional verification request, bulk college batch query, or credential question? Connect with our registrar officers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Info Sidebar (5 cols) */}
        <div className="lg:col-span-5 bg-navy-950 text-white rounded-3xl p-8 sm:p-10 shadow-premium-lg border border-navy-900 flex flex-col justify-between space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-serif text-white">Central Registrar Office</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our certification administration maintains active correspondence with accredited academic institutions and employer background verification agencies.
            </p>

            <div className="space-y-5 text-sm text-slate-300 pt-2">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Location</p>
                  <p className="mt-0.5 leading-relaxed">
                    Tower B, 4th Floor, Logix Cyber Park, Sector 62, Electronic City, Noida, Uttar Pradesh 201309
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Inquiry</p>
                  <a href="mailto:certifications@nexora-tech.com" className="text-white hover:text-gold-400 mt-0.5 block">
                    certifications@nexora-tech.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Telephone Desk</p>
                  <p className="mt-0.5">+91 (080) 4567-8900</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Operating Hours</p>
                  <p className="mt-0.5">Monday – Friday: 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-navy-800 text-xs text-slate-400">
            For rapid validation, use our automated <span className="text-gold-400 font-semibold">Verify Certificate</span> desk anytime.
          </div>

        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-premium">
          
          {submitted ? (
            <div className="text-center py-12 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-serif">Message Transmitted</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for your message. An industrial training coordinator has logged your request and will respond within 1 business day.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-navy-900 text-white font-semibold text-xs hover:bg-navy-800 transition-colors"
              >
                Send Another Inquery
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">Send an Official Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-sm"
                  />
                  {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="name@university.edu or name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-sm"
                  />
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  placeholder="e.g. Batch Verification or Curriculum Inquiries"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-sm"
                />
                {errors.subject && <p className="text-xs text-rose-500 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  {...register('message')}
                  placeholder="Provide complete details including Certificate IDs or institution information if applicable..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-sm"
                />
                {errors.message && <p className="text-xs text-rose-500 mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm tracking-wide shadow-sm transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                    <span>Submitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-gold-400" />
                    <span>Transmit Message</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
