import React from 'react';

export default function StatCard({ icon: Icon, label, value, sub, accent = 'sage', to }) {
  const accentMap = {
    sage: 'bg-sage-100 text-sage-700',
    mist: 'bg-mist-100 text-mist-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  return (
    <div className="card flex items-start gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentMap[accent] || accentMap.sage}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</div>
        <div className="text-2xl font-semibold text-slate-800 mt-1 truncate">{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}
