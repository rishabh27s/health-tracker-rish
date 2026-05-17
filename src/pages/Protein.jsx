import React, { useMemo, useState } from 'react';
import { Beef, Plus, Settings2, Trash2 } from 'lucide-react';
import { useLocalStorage, dateKey, lastNDateKeys, shortDay } from '../hooks/useLocalStorage.js';
import { findFood } from '../data/foods.js';
import PageHeader from '../components/PageHeader.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import HistoryChart from '../components/HistoryChart.jsx';
import EmptyState from '../components/EmptyState.jsx';

function proteinFromFoodLog(foodLog, dayKey) {
  const entries = foodLog[dayKey] || [];
  let total = 0;
  for (const e of entries) {
    const f = findFood(e.foodId);
    if (!f) continue;
    total += f.protein * (e.servings || 0);
  }
  return total;
}

export default function Protein() {
  const today = dateKey();
  const [foodLog] = useLocalStorage('ht.food.log', {});
  // manual extra protein per day: { 'YYYY-MM-DD': [{ id, label, grams }] }
  const [manual, setManual] = useLocalStorage('ht.protein.manual', {});
  const [goal, setGoal] = useLocalStorage('ht.protein.goal', 100);
  const [editingGoal, setEditingGoal] = useState(false);
  const [grams, setGrams] = useState('');
  const [label, setLabel] = useState('');

  const todayManual = manual[today] || [];
  const fromFood = proteinFromFoodLog(foodLog, today);
  const fromManual = todayManual.reduce((sum, e) => sum + (Number(e.grams) || 0), 0);
  const total = +(fromFood + fromManual).toFixed(1);
  const pct = Math.min(100, Math.round((total / goal) * 100));

  function addManual() {
    const g = Number(grams);
    if (!g || g <= 0) return;
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      label: label.trim() || 'Quick protein',
      grams: g,
    };
    setManual((prev) => ({ ...prev, [today]: [...(prev[today] || []), entry] }));
    setGrams('');
    setLabel('');
  }

  function removeManual(id) {
    setManual((prev) => ({ ...prev, [today]: (prev[today] || []).filter((e) => e.id !== id) }));
  }

  const history = useMemo(() => {
    return lastNDateKeys(7).map((k) => {
      const fromFoodK = proteinFromFoodLog(foodLog, k);
      const fromManualK = (manual[k] || []).reduce((s, e) => s + (Number(e.grams) || 0), 0);
      return { key: k, day: shortDay(k), value: +(fromFoodK + fromManualK).toFixed(1) };
    });
  }, [foodLog, manual]);

  return (
    <div>
      <PageHeader
        title="Protein Intake"
        subtitle="Auto-calculated from your food log. Add quick entries below for shakes, snacks, etc."
        action={
          <button className="btn-secondary" onClick={() => setEditingGoal((s) => !s)}>
            <Settings2 size={16} /> Goal
          </button>
        }
      />

      {editingGoal && (
        <div className="card mb-6">
          <label className="text-sm text-slate-600">Daily protein goal (g)</label>
          <input
            type="number"
            min="20"
            max="400"
            className="input mt-1 max-w-xs"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value) || 0)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card lg:col-span-1 flex flex-col items-center justify-center text-center">
          <ProgressRing
            value={total}
            max={goal}
            size={180}
            color="#7c3aed"
            trackColor="#ede9fe"
            label={`${total}g`}
            sublabel={`/ ${goal}g • ${pct}%`}
          />
          <div className="grid grid-cols-2 gap-2 mt-4 w-full text-sm">
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <div className="text-xs text-slate-500">From food</div>
              <div className="font-semibold">{fromFood.toFixed(1)} g</div>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <div className="text-xs text-slate-500">Quick add</div>
              <div className="font-semibold">{fromManual.toFixed(1)} g</div>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-800">Past 7 days</h2>
            <span className="text-xs text-slate-500">grams per day</span>
          </div>
          {history.every((h) => h.value === 0) ? (
            <EmptyState
              icon={Beef}
              title="No protein tracked yet"
              message="Log foods or add a quick entry below to start your week."
            />
          ) : (
            <HistoryChart data={history} color="#7c3aed" unit="g" />
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-3">Quick add protein</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input md:col-span-1" placeholder="Label (e.g. whey shake)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <input
            className="input md:col-span-1"
            type="number"
            min="0"
            step="1"
            placeholder="Grams of protein"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
          />
          <button className="btn-primary" onClick={addManual}>
            <Plus size={16} /> Add
          </button>
        </div>

        {todayManual.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100">
            {todayManual.map((e) => (
              <li key={e.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 text-sm">{e.label}</div>
                  <div className="text-xs text-slate-500">{e.grams} g protein</div>
                </div>
                <button className="btn-ghost p-2 text-slate-400 hover:text-rose-500" onClick={() => removeManual(e.id)} aria-label="Remove">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
