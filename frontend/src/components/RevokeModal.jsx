import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export default function RevokeModal({ isOpen, onClose, onConfirm, certificateId }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('A mandatory revocation reason (minimum 5 characters) must be supplied.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to revoke certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revoke Certificate</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{certificateId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Revoking an issued certificate permanently updates its status across all public verification channels and QR code scans. This action cannot be silently undone and is logged in the permanent audit trail.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Reason for Revocation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Failed final curriculum evaluation, attendance deficiency, or academic integrity violation..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm shadow-sm"
              disabled={loading}
              required
            />
            {error && <p className="text-xs font-medium text-rose-600 mt-1.5">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Confirm Permanent Revocation</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
