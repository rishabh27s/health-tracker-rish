import React from 'react';

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="text-center py-10 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-600 mx-auto flex items-center justify-center mb-3">
          <Icon size={22} />
        </div>
      )}
      <div className="font-medium text-slate-800">{title}</div>
      {message && <div className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{message}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
