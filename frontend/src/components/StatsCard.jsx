import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'navy' }) {
  const colorStyles = {
    navy: 'bg-navy-50 text-navy-800 border-navy-100',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    rose: 'bg-rose-50 text-rose-800 border-rose-100',
    gold: 'bg-gold-50 text-gold-900 border-gold-200',
  };

  const iconColors = {
    navy: 'text-navy-700 bg-white shadow-sm',
    emerald: 'text-emerald-700 bg-white shadow-sm',
    amber: 'text-amber-700 bg-white shadow-sm',
    rose: 'text-rose-700 bg-white shadow-sm',
    gold: 'text-gold-700 bg-white shadow-sm',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-premium transition-all hover:shadow-premium-lg flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-3.5 rounded-xl border ${iconColors[color] || iconColors.navy}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
