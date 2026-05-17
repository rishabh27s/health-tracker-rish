import React, { useMemo, useState } from 'react';
import { Sun, Moon, Plus, Trash2, Flame, Sparkles } from 'lucide-react';
import { useLocalStorage, dateKey } from '../hooks/useLocalStorage.js';
import { defaultMorningRoutine, defaultNightRoutine } from '../data/skincare.js';
import PageHeader from '../components/PageHeader.jsx';

function calcStreak(log, key) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const k = dateKey(d);
    if (log[k] && log[k][key]) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

function RoutineSection({ title, icon: Icon, routine, setRoutine, log, setLog, slot }) {
  const today = dateKey();
  const todayLog = log[today] || {};
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  function toggle(stepId) {
    const key = `${slot}:${stepId}`;
    setLog((prev) => {
      const day = { ...(prev[today] || {}) };
      if (day[key]) delete day[key];
      else day[key] = true;
      return { ...prev, [today]: day };
    });
  }

  function add() {
    if (!name.trim()) return;
    const id = `custom-${Date.now()}`;
    setRoutine((prev) => [...prev, { id, name: name.trim(), note: note.trim() }]);
    setName('');
    setNote('');
    setAdding(false);
  }

  function remove(id) {
    setRoutine((prev) => prev.filter((s) => s.id !== id));
  }

  const completedToday = routine.filter((s) => todayLog[`${slot}:${s.id}`]).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
            <Icon size={18} />
          </div>
          <div>
            <div className="font-semibold text-slate-800">{title}</div>
            <div className="text-xs text-slate-500">
              {completedToday} / {routine.length} done today
            </div>
          </div>
        </div>
        <button className="btn-ghost text-sm" onClick={() => setAdding((s) => !s)}>
          <Plus size={14} /> Step
        </button>
      </div>

      {adding && (
        <div className="bg-slate-50 rounded-xl p-3 mb-3">
          <input className="input mb-2" placeholder="Step name (e.g. Retinol)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input mb-2" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={add}>Save</button>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {routine.map((s) => {
          const key = `${slot}:${s.id}`;
          const checked = !!todayLog[key];
          const streak = calcStreak(log, key);
          return (
            <li
              key={s.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                checked ? 'bg-sage-50 border-sage-200' : 'bg-white border-slate-100'
              }`}
            >
              <button
                onClick={() => toggle(s.id)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                  checked ? 'bg-sage-500 border-sage-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {checked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium text-slate-800 text-sm">{s.name}</div>
                  {streak > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      <Flame size={11} /> {streak}d
                    </span>
                  )}
                </div>
                {s.note && <div className="text-xs text-slate-500 mt-0.5">{s.note}</div>}
              </div>
              <button className="btn-ghost p-1.5 text-slate-400 hover:text-rose-500" onClick={() => remove(s.id)} aria-label="Remove">
                <Trash2 size={14} />
              </button>
            </li>
          );
        })}
        {routine.length === 0 && <li className="text-sm text-slate-500 px-1">No steps yet — add one above.</li>}
      </ul>
    </div>
  );
}

export default function Skincare() {
  const [morning, setMorning] = useLocalStorage('ht.skincare.morning', defaultMorningRoutine);
  const [night, setNight] = useLocalStorage('ht.skincare.night', defaultNightRoutine);
  const [log, setLog] = useLocalStorage('ht.skincare.log', {});

  return (
    <div>
      <PageHeader
        title="Skincare Routine"
        subtitle="Customize your morning and night steps. Check off daily; streaks build over time."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RoutineSection
          title="Morning"
          icon={Sun}
          routine={morning}
          setRoutine={setMorning}
          log={log}
          setLog={setLog}
          slot="am"
        />
        <RoutineSection
          title="Night"
          icon={Moon}
          routine={night}
          setRoutine={setNight}
          log={log}
          setLog={setLog}
          slot="pm"
        />
      </div>

      <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
        <Sparkles size={14} /> Tip: even on busy days, sunscreen + moisturizer is the bare minimum.
      </div>
    </div>
  );
}
