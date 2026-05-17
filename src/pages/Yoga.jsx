import React, { useMemo, useState } from 'react';
import {
  Flower2,
  Brain,
  Plus,
  Trash2,
  Search,
  Flame,
  Clock,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Pencil,
} from 'lucide-react';
import { useLocalStorage, dateKey, lastNDateKeys, shortDay } from '../hooks/useLocalStorage.js';
import {
  defaultYogaPoses,
  YOGA_CATEGORIES,
  YOGA_DIFFICULTIES,
} from '../data/yoga.js';
import { defaultMeditations, MEDITATION_STYLES } from '../data/meditation.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import HistoryChart from '../components/HistoryChart.jsx';

function slugify(s) {
  return (
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
    `item-${Date.now()}`
  );
}

export default function Yoga() {
  const today = dateKey();

  // Custom additions merge with built-ins; same id replaces built-in
  const [customPoses, setCustomPoses] = useLocalStorage('ht.yoga.custom', []);
  const [customMeds, setCustomMeds] = useLocalStorage('ht.meditation.custom', []);

  const poses = useMemo(() => {
    const ids = new Set(customPoses.map((p) => p.id));
    return [...defaultYogaPoses.filter((p) => !ids.has(p.id)), ...customPoses];
  }, [customPoses]);

  const meditations = useMemo(() => {
    const ids = new Set(customMeds.map((m) => m.id));
    return [...defaultMeditations.filter((m) => !ids.has(m.id)), ...customMeds];
  }, [customMeds]);

  // session log: { 'YYYY-MM-DD': [{ id, kind, refId, duration, notes, addedAt }] }
  const [log, setLog] = useLocalStorage('ht.mindfulness.log', {});
  const todayEntries = log[today] || [];

  const totalMinutes = todayEntries.reduce((s, e) => s + (Number(e.duration) || 0), 0);

  // Streak: consecutive days with at least 1 logged session
  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    while (true) {
      const k = dateKey(d);
      if ((log[k] || []).length > 0) {
        s += 1;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return s;
  }, [log]);

  const history = useMemo(() => {
    return lastNDateKeys(7).map((k) => ({
      key: k,
      day: shortDay(k),
      value: (log[k] || []).reduce((sum, e) => sum + (Number(e.duration) || 0), 0),
    }));
  }, [log]);

  // Quick-log form state
  const [kind, setKind] = useState('yoga');
  const [refId, setRefId] = useState('');
  const [duration, setDuration] = useState(15);
  const [notes, setNotes] = useState('');

  function logSession(presetKind, presetRefId) {
    const k = presetKind || kind;
    const r = presetRefId || refId;
    if (!r) return;
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      kind: k,
      refId: r,
      duration: Number(duration) || 0,
      notes: notes.trim(),
      addedAt: Date.now(),
    };
    setLog((prev) => ({ ...prev, [today]: [...(prev[today] || []), entry] }));
    setRefId('');
    setNotes('');
  }

  function quickAdd(kind, refId, duration) {
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      kind,
      refId,
      duration,
      notes: '',
      addedAt: Date.now(),
    };
    setLog((prev) => ({ ...prev, [today]: [...(prev[today] || []), entry] }));
  }

  function removeEntry(id) {
    setLog((prev) => ({
      ...prev,
      [today]: (prev[today] || []).filter((e) => e.id !== id),
    }));
  }

  function lookup(entry) {
    const arr = entry.kind === 'yoga' ? poses : meditations;
    return arr.find((x) => x.id === entry.refId);
  }

  return (
    <div>
      <PageHeader
        title="Yoga & Meditation"
        subtitle="Move, breathe, and sit. Log a session, browse the library, and watch your streak grow."
      />

      {/* Today's stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          icon={Clock}
          label="Today"
          value={`${totalMinutes} min`}
          sub={`${todayEntries.length} session${todayEntries.length === 1 ? '' : 's'}`}
          accent="sage"
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${streak}d`}
          sub="consecutive days"
          accent="amber"
        />
        <StatCard
          icon={Flower2}
          label="Yoga poses"
          value={poses.length}
          sub={`${customPoses.length} custom`}
          accent="violet"
        />
        <StatCard
          icon={Brain}
          label="Meditations"
          value={meditations.length}
          sub={`${customMeds.length} custom`}
          accent="mist"
        />
      </div>

      {/* Quick log + history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card lg:col-span-1">
          <h2 className="font-semibold text-slate-800 mb-3">Log a session</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Type</label>
              <select
                className="input mt-1"
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  setRefId('');
                }}
              >
                <option value="yoga">Yoga</option>
                <option value="meditation">Meditation</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">
                {kind === 'yoga' ? 'Pose / sequence' : 'Meditation'}
              </label>
              <select
                className="input mt-1"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
              >
                <option value="">— pick one —</option>
                {(kind === 'yoga' ? poses : meditations).map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Duration (min)</label>
              <input
                type="number"
                min="1"
                className="input mt-1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Notes (optional)</label>
              <input
                className="input mt-1"
                placeholder="how it felt, modifications..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button className="btn-primary w-full" onClick={() => logSession()} disabled={!refId}>
              <Plus size={16} /> Log session
            </button>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-800">Past 7 days</h2>
            <span className="text-xs text-slate-500">minutes per day</span>
          </div>
          {history.every((h) => h.value === 0) ? (
            <EmptyState
              icon={Flower2}
              title="No sessions yet"
              message="Log a session on the left or pick something from the library below."
            />
          ) : (
            <HistoryChart data={history} color="#7c3aed" unit="min" />
          )}
        </div>
      </div>

      {/* Today's sessions */}
      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Today's sessions</h2>
        {todayEntries.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing logged yet today.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {todayEntries.map((e) => {
              const ref = lookup(e);
              return (
                <li key={e.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 text-sm">
                      {ref ? ref.name : 'Unknown'}{' '}
                      <span className="chip ml-2 capitalize">{e.kind}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {e.duration} min{e.notes ? ` • ${e.notes}` : ''}
                    </div>
                  </div>
                  <button
                    className="btn-ghost p-2 text-slate-400 hover:text-rose-500"
                    onClick={() => removeEntry(e.id)}
                    aria-label="Remove session"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Library */}
      <Library
        poses={poses}
        meditations={meditations}
        customPoses={customPoses}
        customMeds={customMeds}
        setCustomPoses={setCustomPoses}
        setCustomMeds={setCustomMeds}
        onQuickAdd={quickAdd}
      />
    </div>
  );
}

function Library({
  poses,
  meditations,
  customPoses,
  customMeds,
  setCustomPoses,
  setCustomMeds,
  onQuickAdd,
}) {
  const [tab, setTab] = useState('yoga');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [style, setStyle] = useState('all');

  const filteredPoses = useMemo(() => {
    let items = poses;
    if (category !== 'all') items = items.filter((p) => p.category === category);
    if (difficulty !== 'all') items = items.filter((p) => p.difficulty === difficulty);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sanskrit || '').toLowerCase().includes(q) ||
          (p.benefits || []).some((b) => b.toLowerCase().includes(q))
      );
    }
    return items;
  }, [poses, category, difficulty, query]);

  const filteredMeds = useMemo(() => {
    let items = meditations;
    if (style !== 'all') items = items.filter((m) => m.style === style);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.benefits || []).some((b) => b.toLowerCase().includes(q))
      );
    }
    return items;
  }, [meditations, style, query]);

  const isYoga = tab === 'yoga';

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <TabButton active={isYoga} onClick={() => setTab('yoga')}>
            <Flower2 size={14} /> Yoga
          </TabButton>
          <TabButton active={!isYoga} onClick={() => setTab('meditation')}>
            <Brain size={14} /> Meditation
          </TabButton>
        </div>
      </div>

      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder={
                isYoga
                  ? 'Search by name, sanskrit, or benefit'
                  : 'Search by name or benefit'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {isYoga ? (
            <div className="grid grid-cols-2 gap-2">
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                {YOGA_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="all">All levels</option>
                {YOGA_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d[0].toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="all">All styles</option>
              {MEDITATION_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isYoga ? (
        <PoseGrid
          poses={filteredPoses}
          customPoses={customPoses}
          setCustomPoses={setCustomPoses}
          onQuickAdd={onQuickAdd}
        />
      ) : (
        <MeditationGrid
          meds={filteredMeds}
          customMeds={customMeds}
          setCustomMeds={setCustomMeds}
          onQuickAdd={onQuickAdd}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${
        active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PoseGrid({ poses, customPoses, setCustomPoses, onQuickAdd }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  function save(item) {
    setCustomPoses((prev) => [...prev.filter((p) => p.id !== item.id), item]);
    setAdding(false);
    setEditing(null);
  }

  function remove(id) {
    setCustomPoses((prev) => prev.filter((p) => p.id !== id));
  }

  const isCustom = (id) => customPoses.some((p) => p.id === id);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button className="btn-primary" onClick={() => setAdding(true)}>
          <Plus size={16} /> Add custom pose
        </button>
      </div>

      {(adding || editing) && (
        <PoseEditor
          initial={editing}
          onCancel={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}

      {poses.length === 0 ? (
        <div className="card">
          <EmptyState icon={Flower2} title="No poses match" message="Try clearing filters or another search." />
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {poses.map((p) => (
            <li key={p.id}>
              <PoseCard
                pose={p}
                isCustom={isCustom(p.id)}
                onEdit={() => setEditing(p)}
                onRemove={() => remove(p.id)}
                onQuickAdd={(min) => onQuickAdd('yoga', p.id, min)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MeditationGrid({ meds, customMeds, setCustomMeds, onQuickAdd }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  function save(item) {
    setCustomMeds((prev) => [...prev.filter((m) => m.id !== item.id), item]);
    setAdding(false);
    setEditing(null);
  }

  function remove(id) {
    setCustomMeds((prev) => prev.filter((m) => m.id !== id));
  }

  const isCustom = (id) => customMeds.some((m) => m.id === id);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button className="btn-primary" onClick={() => setAdding(true)}>
          <Plus size={16} /> Add custom meditation
        </button>
      </div>

      {(adding || editing) && (
        <MeditationEditor
          initial={editing}
          onCancel={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}

      {meds.length === 0 ? (
        <div className="card">
          <EmptyState icon={Brain} title="No meditations match" message="Try clearing filters or another search." />
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {meds.map((m) => (
            <li key={m.id}>
              <MeditationCard
                med={m}
                isCustom={isCustom(m.id)}
                onEdit={() => setEditing(m)}
                onRemove={() => remove(m.id)}
                onQuickAdd={(min) => onQuickAdd('meditation', m.id, min)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PoseCard({ pose, isCustom, onEdit, onRemove, onQuickAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-slate-800">{pose.name}</div>
          {pose.sanskrit && (
            <div className="text-xs italic text-slate-500 mt-0.5">{pose.sanskrit}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="chip capitalize">{pose.category.replace('-', ' ')}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 capitalize">
            {pose.difficulty}
          </span>
        </div>
      </div>

      <div className="text-xs text-slate-500 mt-2 inline-flex items-center gap-1">
        <Clock size={12} /> {pose.duration}
      </div>

      <ul className="mt-3 text-sm text-slate-600 list-disc pl-5 space-y-0.5">
        {(pose.benefits || []).slice(0, 3).map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <button
        className="btn-ghost text-xs mt-2 px-2"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {open ? 'Hide details' : 'How to do it'}
      </button>
      {open && (
        <div className="mt-2 text-sm text-slate-600 space-y-2">
          <p>{pose.howTo}</p>
          {pose.cautions && (
            <p className="text-xs text-rose-700 bg-rose-50 rounded-lg px-3 py-2">
              <span className="font-medium">Cautions:</span> {pose.cautions}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="flex gap-1">
          <button className="btn-ghost text-xs" onClick={() => onQuickAdd(5)}>+ 5 min</button>
          <button className="btn-ghost text-xs" onClick={() => onQuickAdd(15)}>+ 15 min</button>
          <button className="btn-ghost text-xs" onClick={() => onQuickAdd(30)}>+ 30 min</button>
        </div>
        {isCustom && (
          <div className="flex gap-1">
            <button className="btn-ghost text-xs" onClick={onEdit} aria-label="Edit"><Pencil size={12} /></button>
            <button className="btn-ghost text-xs text-rose-600 hover:bg-rose-50" onClick={onRemove} aria-label="Delete"><Trash2 size={12} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function MeditationCard({ med, isCustom, onEdit, onRemove, onQuickAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-slate-800">{med.name}</div>
          {med.bestTime && <div className="text-xs text-slate-500 mt-0.5">Best: {med.bestTime}</div>}
        </div>
        <span className="chip capitalize">{med.style}</span>
      </div>

      <div className="text-xs text-slate-500 mt-2 inline-flex items-center gap-1">
        <Clock size={12} /> {med.duration}
      </div>

      <ul className="mt-3 text-sm text-slate-600 list-disc pl-5 space-y-0.5">
        {(med.benefits || []).slice(0, 3).map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <button className="btn-ghost text-xs mt-2 px-2" onClick={() => setOpen((o) => !o)}>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {open ? 'Hide details' : 'How to practice'}
      </button>
      {open && (
        <div className="mt-2 text-sm text-slate-600">
          <p>{med.howTo}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="flex gap-1">
          <button className="btn-ghost text-xs" onClick={() => onQuickAdd(5)}>+ 5 min</button>
          <button className="btn-ghost text-xs" onClick={() => onQuickAdd(10)}>+ 10 min</button>
          <button className="btn-ghost text-xs" onClick={() => onQuickAdd(20)}>+ 20 min</button>
        </div>
        {isCustom && (
          <div className="flex gap-1">
            <button className="btn-ghost text-xs" onClick={onEdit} aria-label="Edit"><Pencil size={12} /></button>
            <button className="btn-ghost text-xs text-rose-600 hover:bg-rose-50" onClick={onRemove} aria-label="Delete"><Trash2 size={12} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function PoseEditor({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(
    initial || {
      name: '',
      sanskrit: '',
      category: 'standing',
      difficulty: 'beginner',
      duration: '',
      benefits: '',
      howTo: '',
      cautions: '',
    }
  );

  const benefitsStr =
    typeof form.benefits === 'string' ? form.benefits : (form.benefits || []).join('\n');

  function save() {
    if (!form.name.trim()) return;
    onSave({
      id: initial?.id || slugify(form.name),
      name: form.name.trim(),
      sanskrit: form.sanskrit.trim(),
      category: form.category,
      difficulty: form.difficulty,
      duration: form.duration.trim() || '—',
      benefits: benefitsStr.split('\n').map((b) => b.trim()).filter(Boolean),
      howTo: form.howTo.trim(),
      cautions: form.cautions.trim(),
    });
  }

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">{initial ? 'Edit pose' : 'New pose'}</h3>
        <button className="btn-ghost" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Name *</label>
          <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Sanskrit name</label>
          <input className="input mt-1" value={form.sanskrit} onChange={(e) => setForm({ ...form, sanskrit: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Category</label>
          <select className="input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {YOGA_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1).replace('-', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Difficulty</label>
          <select className="input mt-1" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            {YOGA_DIFFICULTIES.map((d) => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Duration</label>
          <input className="input mt-1" placeholder="e.g. 30 sec - 1 min" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Benefits — one per line</label>
          <textarea className="input mt-1" rows={3} value={benefitsStr} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">How to do it</label>
          <textarea className="input mt-1" rows={3} value={form.howTo} onChange={(e) => setForm({ ...form, howTo: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Cautions (optional)</label>
          <input className="input mt-1" value={form.cautions} onChange={(e) => setForm({ ...form, cautions: e.target.value })} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={!form.name.trim()}><Save size={16} /> Save</button>
      </div>
    </div>
  );
}

function MeditationEditor({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(
    initial || {
      name: '',
      style: 'mindfulness',
      duration: '',
      bestTime: '',
      benefits: '',
      howTo: '',
    }
  );

  const benefitsStr =
    typeof form.benefits === 'string' ? form.benefits : (form.benefits || []).join('\n');

  function save() {
    if (!form.name.trim()) return;
    onSave({
      id: initial?.id || slugify(form.name),
      name: form.name.trim(),
      style: form.style,
      duration: form.duration.trim() || '—',
      bestTime: form.bestTime.trim(),
      benefits: benefitsStr.split('\n').map((b) => b.trim()).filter(Boolean),
      howTo: form.howTo.trim(),
    });
  }

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">{initial ? 'Edit meditation' : 'New meditation'}</h3>
        <button className="btn-ghost" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Name *</label>
          <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Style</label>
          <select className="input mt-1" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
            {MEDITATION_STYLES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Duration</label>
          <input className="input mt-1" placeholder="e.g. 10-20 min" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Best time</label>
          <input className="input mt-1" placeholder="e.g. Morning, before sleep" value={form.bestTime} onChange={(e) => setForm({ ...form, bestTime: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Benefits — one per line</label>
          <textarea className="input mt-1" rows={3} value={benefitsStr} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">How to practice</label>
          <textarea className="input mt-1" rows={3} value={form.howTo} onChange={(e) => setForm({ ...form, howTo: e.target.value })} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={!form.name.trim()}><Save size={16} /> Save</button>
      </div>
    </div>
  );
}
