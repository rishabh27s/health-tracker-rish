import React, { useState } from 'react';
import { Sparkles, Calendar, Settings2 } from 'lucide-react';
import { useStartDate } from '../hooks/useStartDate.js';

/**
 * Wraps tracker pages: shows a friendly "starts on X" screen until the start
 * date arrives. After it does, renders the children normally.
 */
export default function TrackerGate({ children, label = 'this tracker' }) {
  const { startDate, setStartDate, hasStarted, daysUntil } = useStartDate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(startDate);

  if (hasStarted) return children;

  const longDate = formatLong(startDate);
  const dayWord = daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;

  return (
    <div>
      <div className="card max-w-2xl mx-auto text-center mt-6">
        <div className="w-14 h-14 rounded-2xl bg-sage-100 text-sage-700 mx-auto flex items-center justify-center mb-4">
          <Sparkles size={26} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800">Your journey starts {dayWord}</h1>
        <p className="text-slate-600 mt-2">
          Tracking for {label} begins on <span className="font-medium text-slate-800">{longDate}</span>.
          Come back then for a clean Day 1 — fresh streaks, fresh charts, fresh progress.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-50 text-sage-700 text-sm border border-sage-100">
          <Calendar size={14} /> Day 1 · {longDate}
        </div>

        <div className="mt-6">
          {!editing ? (
            <button className="btn-ghost text-sm" onClick={() => setEditing(true)}>
              <Settings2 size={14} /> Change start date
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <input
                type="date"
                className="input max-w-[200px]"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={() => {
                  if (draft) setStartDate(draft);
                  setEditing(false);
                }}
              >
                Save
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setDraft(startDate);
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Browsing pages (Mind Library, Food Benefits, Weight-Loss Foods, My Foods) are open already.
      </p>
    </div>
  );
}

function formatLong(d) {
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(y, m - 1, day);
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
