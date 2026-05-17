import React, { useMemo, useState } from 'react';
import { Plus, Trash2, ChefHat, Pencil, Save, X, Search } from 'lucide-react';
import { useFoods, slugify } from '../hooks/useFoods.js';
import { FOOD_CATEGORIES } from '../data/foods.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const EMPTY = {
  name: '',
  category: 'protein',
  servingSize: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  benefits: '',
  weightLossFriendly: false,
  tags: '',
};

export default function MyFoods() {
  const { foods, customFoods, isCustom, addFood, removeFood } = useFoods();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState('');

  function startNew() {
    setForm(EMPTY);
    setEditId(null);
    setEditing(true);
  }

  function startEdit(food) {
    setForm({
      name: food.name,
      category: food.category,
      servingSize: food.servingSize,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
      fiber: String(food.fiber),
      benefits: (food.benefits || []).join('\n'),
      weightLossFriendly: !!food.weightLossFriendly,
      tags: (food.tags || []).join(', '),
    });
    setEditId(food.id);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setEditId(null);
    setForm(EMPTY);
  }

  function save() {
    const name = form.name.trim();
    if (!name) return;
    const id = editId || slugify(name);
    const food = {
      id,
      name,
      category: form.category,
      servingSize: form.servingSize.trim() || '1 serving',
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      fiber: Number(form.fiber) || 0,
      benefits: form.benefits
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean),
      weightLossFriendly: !!form.weightLossFriendly,
      tags: form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    };
    addFood(food);
    cancel();
  }

  const myList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customFoods
      .filter(
        (f) =>
          !q ||
          f.name.toLowerCase().includes(q) ||
          (f.tags || []).some((t) => t.includes(q))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customFoods, query]);

  return (
    <div>
      <PageHeader
        title="My Foods"
        subtitle="Add your own foods. They flow into the food log, weight-loss suggestions, and benefits pages automatically."
        action={
          !editing && (
            <button className="btn-primary" onClick={startNew}>
              <Plus size={16} /> New food
            </button>
          )
        }
      />

      {editing && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">
              {editId ? 'Edit food' : 'New food'}
            </h2>
            <button className="btn-ghost" onClick={cancel} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500">Name *</label>
              <input
                className="input mt-1"
                placeholder="e.g. Mom's Methi Thepla"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Category</label>
              <select
                className="input mt-1"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {FOOD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Serving size</label>
              <input
                className="input mt-1"
                placeholder="e.g. 1 piece (60g)"
                value={form.servingSize}
                onChange={(e) => setForm({ ...form, servingSize: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Calories (kcal)</label>
              <input
                type="number"
                className="input mt-1"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 md:col-span-1">
              <div>
                <label className="text-xs text-slate-500">P (g)</label>
                <input type="number" step="0.1" className="input mt-1" value={form.protein}
                  onChange={(e) => setForm({ ...form, protein: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-500">C (g)</label>
                <input type="number" step="0.1" className="input mt-1" value={form.carbs}
                  onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-500">F (g)</label>
                <input type="number" step="0.1" className="input mt-1" value={form.fat}
                  onChange={(e) => setForm({ ...form, fat: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-500">Fb (g)</label>
                <input type="number" step="0.1" className="input mt-1" value={form.fiber}
                  onChange={(e) => setForm({ ...form, fiber: e.target.value })} />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-slate-500">Benefits — one per line</label>
              <textarea
                className="input mt-1"
                rows={3}
                placeholder={"High in plant protein\nGood source of iron"}
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500">Tags (comma-separated)</label>
              <input
                className="input mt-1"
                placeholder="e.g. indian, breakfast, high-protein"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={form.weightLossFriendly}
                  onChange={(e) => setForm({ ...form, weightLossFriendly: e.target.checked })}
                />
                Weight-loss friendly
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-ghost" onClick={cancel}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={!form.name.trim()}>
              <Save size={16} /> Save food
            </button>
          </div>
        </div>
      )}

      <div className="card mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">Database</div>
          <div className="text-xl font-semibold text-slate-800">
            {foods.length} foods total · <span className="text-sage-700">{customFoods.length} yours</span>
          </div>
        </div>
        <div className="relative w-full max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search your foods"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {customFoods.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ChefHat}
            title="No custom foods yet"
            message="Add the foods you eat that aren't in the built-in list. They'll show up everywhere foods are searched."
            action={
              <button className="btn-primary" onClick={startNew}>
                <Plus size={16} /> Add your first food
              </button>
            }
          />
        </div>
      ) : myList.length === 0 ? (
        <div className="card">
          <EmptyState icon={Search} title="No matches" message="Try a different keyword." />
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myList.map((f) => (
            <li key={f.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800">{f.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {f.servingSize} • {f.calories} kcal • {f.protein}g P
                  </div>
                </div>
                <span className="chip capitalize">{f.category}</span>
              </div>
              {f.benefits?.length > 0 && (
                <ul className="mt-2 text-sm text-slate-600 list-disc pl-5 space-y-0.5">
                  {f.benefits.slice(0, 3).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-end gap-2 mt-3">
                <button className="btn-ghost" onClick={() => startEdit(f)}>
                  <Pencil size={14} /> Edit
                </button>
                <button
                  className="btn-ghost text-rose-600 hover:bg-rose-50"
                  onClick={() => isCustom(f.id) && removeFood(f.id)}
                  aria-label="Delete"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
