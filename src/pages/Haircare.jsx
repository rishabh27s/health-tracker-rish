import React, { useMemo, useState } from 'react';
import { Scissors, Plus, Trash2, Calendar } from 'lucide-react';
import { useLocalStorage, dateKey, lastNDateKeys, shortDay } from '../hooks/useLocalStorage.js';
import { defaultHaircareRoutine } from '../data/haircare.js';
import PageHeader from '../components/PageHeader.jsx';

function countLast7(log, stepId) {
  const days = lastNDateKeys(7);
  return days.reduce((n, k) => n + ((log[k] && log[k][stepId]) ? 1 : 0), 0);
}

export default function Haircare() {
  const [routine, setRoutine] = useLocalStorage('ht.haircare.routine', defaultHaircareRoutine);
  const [log, setLog] = useLocalStorage('ht.haircare.log', {});
  const today = dateKey();
  const todayLog = log[today] || {};

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [note, setNote] = useState('');

  function toggle(stepId) {
    setLog((prev) => {
      const day = { ...(prev[today] || {}) };
      if (day[stepId]) delete day[stepId];
      else day[stepId] = true;
      return { ...prev, [today]: day };
    });
  }

  function add() {
    if (!name.trim()) return;
    const id = `hc-${Date.now()}`;
    setRoutine((prev) => [...prev, { id, name: name.trim(), frequency: frequency.trim() || 'as needed', note: note.trim() }]);
    setName('');
    setFrequency('');
    setNote('');
    setAdding(false);
  }

  function remove(id) {
    setRoutine((prev) => prev.filter((s) => s.id !== id));
  }

  // Build last 7 days grid
  const days = useMemo(() => lastNDateKeys(7), []);

  return (
    <div>
      <PageHeader
        title="Haircare Routine"
        subtitle="Frequency-aware: weekly oiling, periodic masks, daily basics. Tap to mark done for today."
        action={
          <button className="btn-primary" onClick={() => setAdding((s) => !s)}>
            <Plus size={16} /> Step
          </button>
        }
      />

      {adding && (
        <div className="card mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="input" placeholder="Name (e.g. Heat protectant)" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="Frequency (e.g. 2x / week)" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
            <input className="input" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={add}>Save</button>
          </div>
        </div>
      )}

      <div className="card mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">Today</div>
          <div className="text-xl font-semibold text-slate-800">
            {Object.keys(todayLog).length} / {routine.length} done
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Calendar size={14} /> {today}
        </div>
      </div>

      <div className="space-y-3">
        {routine.map((s) => {
          const checked = !!todayLog[s.id];
          const last7 = countLast7(log, s.id);
          return (
            <div key={s.id} className={`card flex items-start gap-3 ${checked ? 'ring-2 ring-sage-300' : ''}`}>
              <button
                onClick={() => toggle(s.id)}
                className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                  checked ? 'bg-sage-500 border-sage-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {checked && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium text-slate-800">{s.name}</div>
                  <span className="chip">{s.frequency}</span>
                  <span className="text-xs text-slate-500">• {last7}/7 days this week</span>
                </div>
                {s.note && <div className="text-sm text-slate-500 mt-1">{s.note}</div>}
                <div className="mt-2 flex gap-1">
                  {days.map((k) => {
                    const done = !!(log[k] && log[k][s.id]);
                    return (
                      <div
                        key={k}
                        title={`${shortDay(k)} ${k}`}
                        className={`h-2 flex-1 rounded-full ${done ? 'bg-sage-500' : 'bg-slate-100'}`}
                      />
                    );
                  })}
                </div>
              </div>
              <button className="btn-ghost p-2 text-slate-400 hover:text-rose-500" onClick={() => remove(s.id)} aria-label="Remove">
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
        {routine.length === 0 && (
          <div className="card text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-600 mx-auto flex items-center justify-center mb-3">
              <Scissors size={20} />
            </div>
            <div className="font-medium">No haircare steps yet</div>
            <div className="text-sm text-slate-500 mt-1">Add your first one above.</div>
          </div>
        )}
      </div>
    </div>
  );
}
