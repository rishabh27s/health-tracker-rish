import React, { useMemo, useState } from 'react';
import { Salad, Search } from 'lucide-react';
import { FOOD_CATEGORIES } from '../data/foods.js';
import { useFoods } from '../hooks/useFoods.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const PROFILE_TAGS = [
  { key: 'all', label: 'All' },
  { key: 'high-protein', label: 'High Protein' },
  { key: 'low-calorie', label: 'Low Calorie' },
  { key: 'high-fiber', label: 'High Fiber' },
];

function reasonFor(food) {
  const reasons = [];
  if (food.protein >= 15) reasons.push('high protein keeps you full');
  if (food.calories <= 100) reasons.push('low calorie density');
  if (food.fiber >= 5) reasons.push('high fiber supports satiety');
  if (food.fat <= 5 && food.calories <= 250) reasons.push('lean choice');
  if (reasons.length === 0) reasons.push('balanced nutrient profile');
  return reasons.join(', ');
}

export default function WeightLoss() {
  const { foods } = useFoods();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [profile, setProfile] = useState('all');

  const list = useMemo(() => {
    let items = foods.filter((f) => f.weightLossFriendly);
    if (category !== 'all') items = items.filter((f) => f.category === category);
    if (profile === 'high-protein') items = items.filter((f) => f.protein >= 15);
    if (profile === 'low-calorie') items = items.filter((f) => f.calories <= 100);
    if (profile === 'high-fiber') items = items.filter((f) => f.fiber >= 5);
    const q = query.trim().toLowerCase();
    if (q) items = items.filter((f) => f.name.toLowerCase().includes(q) || (f.tags || []).some((t) => t.includes(q)));
    return items;
  }, [query, category, profile, foods]);

  return (
    <div>
      <PageHeader
        title="Weight-Loss Friendly Foods"
        subtitle="Curated picks that are filling, nutrient-dense, and easy to fit into your day."
      />

      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by name or tag"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {FOOD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {PROFILE_TAGS.map((t) => (
              <button
                key={t.key}
                onClick={() => setProfile(t.key)}
                className={`px-3 py-2 rounded-xl text-sm border ${
                  profile === t.key ? 'bg-sage-500 text-white border-sage-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState icon={Salad} title="No matches" message="Try clearing filters or searching a different term." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((f) => (
            <div key={f.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-800">{f.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{f.servingSize}</div>
                </div>
                <span className="chip capitalize">{f.category}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
                <Macro label="kcal" value={f.calories} />
                <Macro label="P" value={`${f.protein}g`} />
                <Macro label="C" value={`${f.carbs}g`} />
                <Macro label="Fb" value={`${f.fiber}g`} />
              </div>
              <div className="text-sm text-slate-600 mt-3">
                <span className="font-medium text-sage-700">Why it helps: </span>
                {reasonFor(f)}.
              </div>
              <ul className="mt-2 text-sm text-slate-600 list-disc pl-5 space-y-0.5">
                {(f.benefits || []).slice(0, 2).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Macro({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="font-semibold text-slate-800">{value}</div>
    </div>
  );
}
