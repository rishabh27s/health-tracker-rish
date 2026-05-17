import React, { useMemo, useState } from 'react';
import { Plus, Minus, Trash2, Flame } from 'lucide-react';
import { useLocalStorage, dateKey } from '../hooks/useLocalStorage.js';
import PageHeader from './PageHeader.jsx';
import EmptyState from './EmptyState.jsx';

/**
 * Reusable per-day count tracker for things like dry fruits or superfoods.
 *
 * Props:
 *  - title, subtitle, icon: page chrome
 *  - listKey: localStorage key for the editable item list
 *  - logKey:  localStorage key for the daily counts log
 *  - defaultList: starter array of { id, name, serving, benefit }
 *  - accent: tailwind color name used for active state and streak chip ('sage' | 'mist' | 'violet' | 'amber' | 'rose')
 */
export default function CountTracker({
  title,
  subtitle,
  icon: Icon,
  listKey,
  logKey,
  defaultList,
  accent = 'sage',
}) {
  const [list, setList] = useLocalStorage(listKey, defaultList);
  const [log, setLog] = useLocalStorage(logKey, {});
  const today = dateKey();
  const todayLog = log[today] || {};

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newServing, setNewServing] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  function bump(id, delta) {
    setLog((prev) => {
      const day = { ...(prev[today] || {}) };
      const next = Math.max(0, (day[id] || 0) + delta);
      if (next === 0) delete day[id];
      else day[id] = next;
      return { ...prev, [today]: day };
    });
  }

  function addItem() {
    if (!newName.trim()) return;
    const id = `c-${Date.now()}`;
    setList((prev) => [
      ...prev,
      {
        id,
        name: newName.trim(),
        serving: newServing.trim() || '—',
        benefit: newBenefit.trim(),
      },
    ]);
    setNewName('');
    setNewServing('');
    setNewBenefit('');
    setAdding(false);
  }

  function removeItem(id) {
    setList((prev) => prev.filter((s) => s.id !== id));
  }

  // Streaks: consecutive days going back where item count > 0
  const streaks = useMemo(() => {
    const out = {};
    for (const s of list) {
      let streak = 0;
      const d = new Date();
      while (true) {
        const k = dateKey(d);
        if (log[k] && log[k][s.id] > 0) {
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

  const itemsActiveToday = Object.keys(todayLog).filter((k) => todayLog[k] > 0).length;
  const totalCount = Object.values(todayLog).reduce((s, v) => s + (Number(v) || 0), 0);

  const accentMap = {
    sage: { ring: 'ring-sage-300', chip: 'bg-sage-100 text-sage-700', btn: 'bg-sage-500 border-sage-500 text-white' },
    mist: { ring: 'ring-mist-300', chip: 'bg-mist-100 text-mist-700', btn: 'bg-mist-500 border-mist-500 text-white' },
    violet: { ring: 'ring-violet-300', chip: 'bg-violet-100 text-violet-700', btn: 'bg-violet-500 border-violet-500 text-white' },
    amber: { ring: 'ring-amber-300', chip: 'bg-amber-100 text-amber-700', btn: 'bg-amber-500 border-amber-500 text-white' },
    rose: { ring: 'ring-rose-300', chip: 'bg-rose-100 text-rose-700', btn: 'bg-rose-500 border-rose-500 text-white' },
  };
  const a = accentMap[accent] || accentMap.sage;

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
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
              <input
                className="input mt-1"
                placeholder="e.g. Chia Seeds"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Recommended serving</label>
              <input
                className="input mt-1"
                placeholder="e.g. 1 tbsp"
                value={newServing}
                onChange={(e) => setNewServing(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Benefit</label>
              <input
                className="input mt-1"
                placeholder="optional note"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={addItem}>Save</button>
          </div>
        </div>
      )}

      <div className="card mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">Today</div>
          <div className="text-xl font-semibold text-slate-800">
            {itemsActiveToday} / {list.length} items · {totalCount} total
          </div>
        </div>
        <div className="text-sm text-slate-500">{today}</div>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Icon}
            title={`No ${title.toLowerCase()} yet`}
            message="Add your first item to start tracking."
            action={
              <button className="btn-primary" onClick={() => setAdding(true)}>
                <Plus size={16} /> Add
              </button>
            }
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((s) => {
            const count = todayLog[s.id] || 0;
            const streak = streaks[s.id] || 0;
            const active = count > 0;
            return (
              <li
                key={s.id}
                className={`card flex items-start gap-3 transition ${active ? `ring-2 ${a.ring}` : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium text-slate-800">{s.name}</div>
                    <span className="chip">{s.serving}</span>
                    {streak > 0 && (
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${a.chip}`}>
                        <Flame size={12} /> {streak}d
                      </span>
                    )}
                  </div>
                  {s.benefit && <div className="text-sm text-slate-500 mt-1">{s.benefit}</div>}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
                      onClick={() => bump(s.id, -1)}
                      aria-label="Decrease"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="min-w-[3rem] text-center font-semibold text-slate-800">
                      {count}
                    </div>
                    <button
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center ${a.btn}`}
                      onClick={() => bump(s.id, 1)}
                      aria-label="Increase"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="text-xs text-slate-400 ml-1">today</span>
                  </div>
                </div>
                <button
                  className="btn-ghost p-2 text-slate-400 hover:text-rose-500"
                  onClick={() => removeItem(s.id)}
                  aria-label="Remove"
                >
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
