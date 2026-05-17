import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1 text-sm md:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
