import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').toUpperCase();

  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';
  const iconSize = isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (normalized === 'ISSUED' || normalized === 'VALID') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm ${sizeClasses}`}>
        <CheckCircle2 className={`${iconSize} text-emerald-600`} />
        <span>{normalized === 'VALID' ? 'VALID CREDENTIAL' : 'ISSUED'}</span>
      </span>
    );
  }

  if (normalized === 'REVOKED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-sm ${sizeClasses}`}>
        <XCircle className={`${iconSize} text-rose-600`} />
        <span>REVOKED</span>
      </span>
    );
  }

  if (normalized === 'DRAFT' || normalized === 'DRAFT_UNISSUED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shadow-sm ${sizeClasses}`}>
        <Clock className={`${iconSize} text-amber-600`} />
        <span>DRAFT</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-sm ${sizeClasses}`}>
      <AlertTriangle className={`${iconSize} text-slate-500`} />
      <span>{normalized || 'UNKNOWN'}</span>
    </span>
  );
}
