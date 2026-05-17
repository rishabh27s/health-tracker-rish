import React, { useMemo, useState } from 'react';
import { UtensilsCrossed, Plus, Trash2, Search } from 'lucide-react';
import { useLocalStorage, dateKey } from '../hooks/useLocalStorage.js';
import { useFoods } from '../hooks/useFoods.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];

function scaleEntry(food, servings) {
  const s = Math.max(0, Number(servings) || 0);
  return {
    calories: Math.round(food.calories * s),
    protein: +(food.protein * s).toFixed(1),
    carbs: +(food.carbs * s).toFixed(1),
    fat: +(food.fat * s).toFixed(1),
    fiber: +(food.fiber * s).toFixed(1),
  };
}

export default function FoodLog() {
  const today = dateKey();
  const { foods, findFood } = useFoods();
  // log shape: { 'YYYY-MM-DD': [{ id, foodId, meal, servings, addedAt }] }
  const [log, setLog] = useLocalStorage('ht.food.log', {});
  const [meal, setMeal] = useState('breakfast');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null); // foodId
  const [servings, setServings] = useState(1);

  const todayEntries = log[today] || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foods.slice(0, 20);
    return foods
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          (f.tags || []).some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [query, foods]);

  function addEntry() {
    if (!selected) return;
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      foodId: selected,
      meal,
      servings: Number(servings) || 1,
      addedAt: Date.now(),
    };
    setLog((prev) => ({ ...prev, [today]: [...(prev[today] || []), entry] }));
    setSelected(null);
    setQuery('');
    setServings(1);
  }

  function removeEntry(id) {
    setLog((prev) => ({ ...prev, [today]: (prev[today] || []).filter((e) => e.id !== id) }));
  }

  // Aggregate totals
  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    todayEntries.forEach((e) => {
      const f = findFood(e.foodId);
      if (!f) return;
      const s = scaleEntry(f, e.servings);
      calories += s.calories;
      protein += s.protein;
      carbs += s.carbs;
      fat += s.fat;
      fiber += s.fiber;
    });
    return {
      calories: Math.round(calories),
      protein: +protein.toFixed(1),
      carbs: +carbs.toFixed(1),
      fat: +fat.toFixed(1),
      fiber: +fiber.toFixed(1),
    };
  }, [todayEntries, findFood]);

  const selectedFood = selected ? findFood(selected) : null;

  return (
    <div>
      <PageHeader title="Food Log" subtitle="What you ate today, with macros calculated automatically." />

      {/* Today totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Total label="Calories" value={totals.calories} unit="kcal" />
        <Total label="Protein" value={totals.protein} unit="g" />
        <Total label="Carbs" value={totals.carbs} unit="g" />
        <Total label="Fat" value={totals.fat} unit="g" />
        <Total label="Fiber" value={totals.fiber} unit="g" />
      </div>

      {/* Add entry */}
      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Add food</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-xs text-slate-500">Meal</label>
            <select className="input mt-1" value={meal} onChange={(e) => setMeal(e.target.value)}>
              {MEALS.map((m) => (
                <option key={m} value={m}>
                  {m[0].toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 relative">
            <label className="text-xs text-slate-500">Search food</label>
            <div className="relative mt-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="e.g. paneer, oats, dal"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Servings</label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              className="input mt-1"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>
        </div>

        {/* Suggestions */}
        {!selected && (
          <div className="border border-slate-100 rounded-xl max-h-64 overflow-auto divide-y divide-slate-100">
            {filtered.map((f) => (
              <button
                key={f.id}
                className="w-full text-left px-3 py-2 hover:bg-sage-50 flex items-center justify-between"
                onClick={() => setSelected(f.id)}
              >
                <div>
                  <div className="font-medium text-slate-800 text-sm">{f.name}</div>
                  <div className="text-xs text-slate-500">
                    {f.servingSize} • {f.calories} kcal • {f.protein}g P
                  </div>
                </div>
                <span className="chip capitalize">{f.category}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-sm text-slate-500 text-center">No matches. Try another keyword.</div>
            )}
          </div>
        )}

        {selected && selectedFood && (
          <div className="flex items-center justify-between gap-3 bg-sage-50 border border-sage-100 rounded-xl px-3 py-2">
            <div className="text-sm">
              <div className="font-medium text-slate-800">
                {selectedFood.name} <span className="text-slate-500 font-normal">({selectedFood.servingSize})</span>
              </div>
              <div className="text-xs text-slate-500">
                {servings} serving × {selectedFood.calories} kcal = {Math.round(selectedFood.calories * servings)} kcal,{' '}
                {(selectedFood.protein * servings).toFixed(1)}g protein
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-ghost text-sm" onClick={() => setSelected(null)}>
                Change
              </button>
              <button className="btn-primary" onClick={addEntry}>
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Today's entries by meal */}
      <div className="space-y-4">
        {MEALS.map((m) => {
          const items = todayEntries.filter((e) => e.meal === m);
          return (
            <div key={m} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 capitalize">{m}</h3>
                <span className="text-xs text-slate-500">{items.length} item{items.length === 1 ? '' : 's'}</span>
              </div>
              {items.length === 0 ? (
                <div className="text-sm text-slate-500">Nothing logged for {m} yet.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {items.map((e) => {
                    const f = findFood(e.foodId);
                    if (!f) return null;
                    const s = scaleEntry(f, e.servings);
                    return (
                      <li key={e.id} className="py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 text-sm truncate">
                            {f.name}{' '}
                            <span className="text-slate-500 font-normal">
                              × {e.servings} ({f.servingSize})
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {s.calories} kcal • {s.protein}g P • {s.carbs}g C • {s.fat}g F
                          </div>
                        </div>
                        <button className="btn-ghost p-2 text-slate-400 hover:text-rose-500" onClick={() => removeEntry(e.id)} aria-label="Remove">
                          <Trash2 size={16} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {todayEntries.length === 0 && (
        <div className="card mt-6">
          <EmptyState
            icon={UtensilsCrossed}
            title="Your plate is empty today"
            message="Pick a meal above and search the food database to log your first item."
          />
        </div>
      )}
    </div>
  );
}

function Total({ label, value, unit }) {
  return (
    <div className="card py-3 px-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div className="text-xl font-semibold text-slate-800 mt-1">
        {value} <span className="text-sm text-slate-500 font-normal">{unit}</span>
      </div>
    </div>
  );
}
