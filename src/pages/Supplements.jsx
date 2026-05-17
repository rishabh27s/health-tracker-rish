import React, { useMemo, useState } from 'react';
import { Pill, Plus, Trash2, Flame } from 'lucide-react';
import { useLocalStorage, dateKey } from '../hooks/useLocalStorage.js';
import { defaultSupplements } from '../data/supplements.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Supplements() {
  const [list, setList] = useLocalStorage('ht.supplements.list', defaultSupplements);
  // log shape: { 'YYYY-MM-DD': { supplementId: true } }
  const [log, setLog] = useLocalStorage('ht.supplements.log', {});
  const today = dateKey();
  const todayChecked = log[today] || {};

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newDesc, setNewDesc] = useState('');

  function toggle(id) {
    setLog((prev) => {
      const day = { ...(prev[today] || {}) };
      if (day[id]) delete day[id];
      else day[id] = true;
      return { ...prev, [today]: day };
    });
  }

  function addSupplement() {
    if (!newName.trim()) return;
    const id = `s-${Date.now()}`;
    setList((prev) => [...prev, { id, name: newName.trim(), dose: newDose.trim() || '—', description: newDesc.trim() }]);
    setNewName('');
    setNewDose('');
    setNewDesc('');
    setAdding(false);
  }

  function removeSupplement(id) {
    setList((prev) => prev.filter((s) => s.id !== id));
  }

  // Compute streak per supplement
  const streaks = useMemo(() => {
    const out = {};
    for (const s of list) {
      let streak = 0;
      const d = new Date();
      // count consecutive days going backward where this supplement was checked
      while (true) {
        const k = dateKey(d);
        if (log[k] && log[k][s.id]) {
          streak += 1;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
      out[s.id] = streak;
    }
    return out;
  }, [list, log]);

  const checkedCount = Object.keys(todayChecked).length;

  return (
    <div>
      <PageHeader
        title="Supplements"
        subtitle="Daily check-off. Streaks track consecutive days you've taken each item."
        action={
          <button className="btn-primary" onClick={() => setAdding((s) => !s)}>
            <Plus size={16} /> Add
          </button>
        }
      />

      {adding && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500">Name</label>
              <input className="input mt-1" placeholder="e.g. Ashwagandha" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Dose</label>
              <input className="input mt-1" placeholder="e.g. 600 mg" value={newDose} onChange={(e) => setNewDose(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Note</label>
              <input className="input mt-1" placeholder="optional" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={addSupplement}>Save</button>
          </div>
        </div>
      )}

      <div className="card mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">Today</div>
          <div className="text-xl font-semibold text-slate-800">
            {checkedCount} / {list.length} taken
          </div>
        </div>
        <div className="text-sm text-slate-500">{today}</div>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Pill}
            title="No supplements yet"
            message="Add your first supplement to start tracking."
            action={<button className="btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Add supplement</button>}
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((s) => {
            const checked = !!todayChecked[s.id];
            const streak = streaks[s.id] || 0;
            return (
              <li key={s.id} className={`card flex items-start gap-3 cursor-pointer transition ${checked ? 'ring-2 ring-sage-300' : ''}`}>
                <button
                  onClick={() => toggle(s.id)}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    checked ? 'bg-sage-500 border-sage-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                  aria-label={checked ? 'Uncheck' : 'Check'}
                >
                  {checked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0" onClick={() => toggle(s.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium text-slate-800">{s.name}</div>
                    <span className="chip">{s.dose}</span>
                    {streak > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        <Flame size={12} /> {streak}d
                      </span>
                    )}
                  </div>
                  {s.description && <div className="text-sm text-slate-500 mt-1">{s.description}</div>}
                </div>
                <button className="btn-ghost p-2 text-slate-400 hover:text-rose-500" onClick={() => removeSupplement(s.id)} aria-label="Remove">
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
