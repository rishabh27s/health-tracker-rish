import React, { useMemo } from 'react';
import { Leaf, Plus, Minus, Settings2 } from 'lucide-react';
import { useLocalStorage, dateKey, lastNDateKeys, shortDay } from '../hooks/useLocalStorage.js';
import PageHeader from '../components/PageHeader.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import HistoryChart from '../components/HistoryChart.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function GreenTea() {
  const [log, setLog] = useLocalStorage('ht.greenTea.log', {});
  const [goal, setGoal] = useLocalStorage('ht.greenTea.goal', 3);
  const [editingGoal, setEditingGoal] = React.useState(false);

  const today = dateKey();
  const todayCups = log[today] || 0;
  const pct = Math.min(100, Math.round((todayCups / goal) * 100));

  function add(n) {
    setLog((prev) => ({ ...prev, [today]: Math.max(0, (prev[today] || 0) + n) }));
  }

  const history = useMemo(() => {
    return lastNDateKeys(7).map((k) => ({ key: k, day: shortDay(k), value: log[k] || 0 }));
  }, [log]);

  return (
    <div>
      <PageHeader
        title="Green Tea"
        subtitle="Antioxidants, calm focus, gentle metabolism support."
        action={
          <button className="btn-secondary" onClick={() => setEditingGoal((s) => !s)}>
            <Settings2 size={16} /> Goal
          </button>
        }
      />

      {editingGoal && (
        <div className="card mb-6">
          <label className="text-sm text-slate-600">Daily goal (cups)</label>
          <input
            type="number"
            min="0"
            max="10"
            className="input mt-1 max-w-xs"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value) || 0)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card lg:col-span-1 flex flex-col items-center justify-center text-center">
          <ProgressRing
            value={todayCups}
            max={goal}
            size={180}
            color="#52885b"
            label={`${todayCups}`}
            sublabel={`/ ${goal} cups • ${pct}%`}
          />
          <div className="mt-4 text-sm text-slate-500">Today's cups</div>
          <div className="flex items-center gap-2 mt-4">
            <button className="btn-secondary" onClick={() => add(-1)} aria-label="Remove cup">
              <Minus size={16} />
            </button>
            <button className="btn-primary" onClick={() => add(1)}>
              <Plus size={16} /> Add cup
            </button>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-800">Past 7 days</h2>
            <span className="text-xs text-slate-500">cups per day</span>
          </div>
          {history.every((h) => h.value === 0) ? (
            <EmptyState
              icon={Leaf}
              title="No tea logged yet"
              message="Brew a cup and tap the plus to start your streak."
            />
          ) : (
            <HistoryChart data={history} color="#52885b" unit="cups" />
          )}
        </div>
      </div>
    </div>
  );
}
