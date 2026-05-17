import React, { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { FOOD_CATEGORIES } from '../data/foods.js';
import { useFoods } from '../hooks/useFoods.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function FoodBenefits() {
  const { foods } = useFoods();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const list = useMemo(() => {
    let items = foods;
    if (category !== 'all') items = items.filter((f) => f.category === category);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.tags || []).some((t) => t.includes(q)) ||
          (f.benefits || []).some((b) => b.toLowerCase().includes(q))
      );
    }
    return items;
  }, [query, category, foods]);

  return (
    <div>
      <PageHeader
        title="Food Benefits"
        subtitle="Browse the full database and learn what each food does for your body."
      />

      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search foods or benefits (e.g. iron, omega, vitamin C)"
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
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState icon={BookOpen} title="Nothing found" message="Try a different keyword or category." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((f) => (
            <div key={f.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-800">{f.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {f.servingSize} • {f.calories} kcal • {f.protein}g protein
                  </div>
                </div>
                <span className="chip capitalize">{f.category}</span>
              </div>
              <ul className="mt-3 text-sm text-slate-600 list-disc pl-5 space-y-1">
                {(f.benefits || []).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              {f.tags && f.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {f.tags.map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
