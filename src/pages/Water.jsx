import React, { useMemo } from 'react';
import { Droplets, Plus, Minus, Settings2 } from 'lucide-react';
import { useLocalStorage, dateKey, lastNDateKeys, shortDay } from '../hooks/useLocalStorage.js';
import PageHeader from '../components/PageHeader.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import HistoryChart from '../components/HistoryChart.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Water() {
  const [log, setLog] = useLocalStorage('ht.water.log', {}); // { 'YYYY-MM-DD': ml }
  const [goal, setGoal] = useLocalStorage('ht.water.goal', 2500);
  const [glassSize, setGlassSize] = useLocalStorage('ht.water.glassSize', 250);
  const [editingGoal, setEditingGoal] = React.useState(false);

  const today = dateKey();
  const todayMl = log[today] || 0;
  const pct = Math.min(100, Math.round((todayMl / goal) * 100));

  function add(ml) {
    setLog((prev) => ({ ...prev, [today]: Math.max(0, (prev[today] || 0) + ml) }));
  }
  function setExact(ml) {
    setLog((prev) => ({ ...prev, [today]: Math.max(0, ml) }));
  }

  const history = useMemo(() => {
    return lastNDateKeys(7).map((k) => ({ key: k, day: shortDay(k), value: log[k] || 0 }));
  }, [log]);

  return (
    <div>
      <PageHeader
        title="Water Intake"
        subtitle="Hydration is the easiest health win. Sip throughout the day."
        action={
          <button className="btn-secondary" onClick={() => setEditingGoal((s) => !s)}>
            <Settings2 size={16} /> Goal
          </button>
        }
      />

      {editingGoal && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Daily goal (ml)</label>
              <input
                type="number"
                min="500"
                step="100"
                className="input mt-1"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Glass size (ml)</label>
              <input
                type="number"
                min="50"
                step="50"
                className="input mt-1"
                value={glassSize}
                onChange={(e) => setGlassSize(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card lg:col-span-1 flex flex-col items-center justify-center text-center">
          <ProgressRing
            value={todayMl}
            max={goal}
            size={180}
            color="#3f6c8a"
            trackColor="#e6eff5"
            label={`${todayMl}`}
            sublabel={`/ ${goal} ml • ${pct}%`}
          />
          <div className="mt-4 text-sm text-slate-500">Today's intake</div>
          <div className="flex items-center gap-2 mt-4">
            <button className="btn-secondary" onClick={() => add(-glassSize)} aria-label="Remove glass">
              <Minus size={16} />
            </button>
            <button className="btn-primary" onClick={() => add(glassSize)}>
              <Plus size={16} /> Add glass ({glassSize}ml)
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button className="btn-ghost text-xs" onClick={() => add(100)}>+100</button>
            <button className="btn-ghost text-xs" onClick={() => add(500)}>+500</button>
            <button className="btn-ghost text-xs" onClick={() => setExact(0)}>Reset day</button>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-800">Past 7 days</h2>
            <span className="text-xs text-slate-500">ml per day</span>
          </div>
          {history.every((h) => h.value === 0) ? (
            <EmptyState
              icon={Droplets}
              title="No history yet"
              message="Start logging today and your week will fill in here."
            />
          ) : (
            <HistoryChart data={history} color="#3f6c8a" unit="ml" />
          )}
        </div>
      </div>
    </div>
  );
}
