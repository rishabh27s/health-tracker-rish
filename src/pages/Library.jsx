import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  Search,
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  Sparkles,
  Clock,
  Bookmark,
  BookmarkCheck,
  Check,
  Target,
  TrendingUp,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { useLocalStorage, dateKey } from '../hooks/useLocalStorage.js';
import { defaultLibrary, LIBRARY_CATEGORIES } from '../data/library.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatCard from '../components/StatCard.jsx';

function slugify(s) {
  return (
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
    `entry-${Date.now()}`
  );
}

// Deterministic "article of the day" — same date always picks the same article.
function pickDaily(articles, key) {
  if (articles.length === 0) return null;
  const seed = key.split('-').reduce((s, p) => s + Number(p), 0);
  return articles[seed % articles.length];
}

export default function Library() {
  const today = dateKey();

  const [custom, setCustom] = useLocalStorage('ht.library.custom', []);
  const [bookmarks, setBookmarks] = useLocalStorage('ht.library.bookmarks', []);
  const [readLog, setReadLog] = useLocalStorage('ht.library.read', {}); // { articleId: 'YYYY-MM-DD' }

  const articles = useMemo(() => {
    const ids = new Set(custom.map((a) => a.id));
    return [...defaultLibrary.filter((a) => !ids.has(a.id)), ...custom];
  }, [custom]);

  const daily = useMemo(() => pickDaily(articles, today), [articles, today]);

  const [openId, setOpenId] = useState(null);
  const [editing, setEditing] = useState(null); // { mode: 'new' | 'edit', article? }
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState('all'); // all | bookmarks | unread

  const filtered = useMemo(() => {
    let items = articles;
    if (category !== 'all') items = items.filter((a) => a.category === category);
    if (view === 'bookmarks') items = items.filter((a) => bookmarks.includes(a.id));
    if (view === 'unread') items = items.filter((a) => !readLog[a.id]);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          (a.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (a.paragraphs || []).some((p) => p.toLowerCase().includes(q))
      );
    }
    return items;
  }, [articles, category, view, query, bookmarks, readLog]);

  function toggleBookmark(id) {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function markRead(id) {
    setReadLog((prev) => ({ ...prev, [id]: today }));
  }

  function isCustom(id) {
    return custom.some((c) => c.id === id);
  }

  function saveArticle(item) {
    setCustom((prev) => [...prev.filter((a) => a.id !== item.id), item]);
    setEditing(null);
  }

  function deleteArticle(id) {
    setCustom((prev) => prev.filter((a) => a.id !== id));
    if (openId === id) setOpenId(null);
  }

  const open = openId ? articles.find((a) => a.id === openId) : null;
  const readCount = Object.keys(readLog).length;

  return (
    <div>
      <PageHeader
        title="Mind Library"
        subtitle="A daily read on stress, sleep, brain, and a peaceful mind — plus your living SWOT."
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard icon={BookMarked} label="Articles" value={articles.length} sub={`${custom.length} custom`} accent="violet" />
        <StatCard icon={Bookmark} label="Bookmarks" value={bookmarks.length} sub="for re-reading" accent="amber" />
        <StatCard icon={BookOpen} label="Read so far" value={readCount} sub="of all entries" accent="sage" />
        <StatCard icon={Sparkles} label="Today" value={daily ? '1 pick' : '—'} sub="rotates daily" accent="mist" />
      </div>

      {/* Daily pick */}
      {daily && (
        <div className="card mb-6 border-2 border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-sage-700 uppercase tracking-wide">
              <Sparkles size={14} /> Today's read · {today}
            </div>
            <span className="chip capitalize">{daily.category}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800">{daily.title}</h2>
          <p className="text-slate-600 mt-2">{daily.summary}</p>
          <div className="text-xs text-slate-500 mt-2 inline-flex items-center gap-1">
            <Clock size={12} /> {daily.readMinutes} min read
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={() => setOpenId(daily.id)}>
              <BookOpen size={16} /> Read now
            </button>
            <button
              className="btn-secondary"
              onClick={() => toggleBookmark(daily.id)}
            >
              {bookmarks.includes(daily.id) ? (
                <>
                  <BookmarkCheck size={16} /> Saved
                </>
              ) : (
                <>
                  <Bookmark size={16} /> Save
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SWOT */}
      <SWOT />

      {/* Library */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <h2 className="text-lg font-semibold text-slate-800">Encyclopedia</h2>
        <button className="btn-primary" onClick={() => setEditing({ mode: 'new' })}>
          <Plus size={16} /> Add entry
        </button>
      </div>

      {editing && (
        <ArticleEditor
          initial={editing.mode === 'edit' ? editing.article : null}
          onCancel={() => setEditing(null)}
          onSave={saveArticle}
        />
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search title, summary, tag, or content"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {LIBRARY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-3">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'bookmarks', label: 'Bookmarks' },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 rounded-xl text-sm border ${
                view === v.key
                  ? 'bg-sage-500 text-white border-sage-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={BookMarked} title="Nothing here" message="Try clearing filters, switching categories, or adding your own entry." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((a) => (
            <ArticleCard
              key={a.id}
              article={a}
              isCustom={isCustom(a.id)}
              isBookmarked={bookmarks.includes(a.id)}
              isRead={!!readLog[a.id]}
              onOpen={() => setOpenId(a.id)}
              onBookmark={() => toggleBookmark(a.id)}
              onEdit={() => setEditing({ mode: 'edit', article: a })}
              onDelete={() => deleteArticle(a.id)}
            />
          ))}
        </div>
      )}

      {open && (
        <ArticleModal
          article={open}
          isBookmarked={bookmarks.includes(open.id)}
          isRead={!!readLog[open.id]}
          onClose={() => setOpenId(null)}
          onBookmark={() => toggleBookmark(open.id)}
          onMarkRead={() => markRead(open.id)}
        />
      )}
    </div>
  );
}

function ArticleCard({ article, isCustom, isBookmarked, isRead, onOpen, onBookmark, onEdit, onDelete }) {
  return (
    <div className="card flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800">{article.title}</h3>
            {isRead && (
              <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-sage-100 text-sage-700">
                <Check size={10} /> Read
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1 inline-flex items-center gap-2">
            <span className="chip capitalize">{article.category}</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} /> {article.readMinutes} min
            </span>
          </div>
        </div>
        <button
          className="btn-ghost p-2"
          onClick={onBookmark}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {isBookmarked ? <BookmarkCheck size={16} className="text-amber-600" /> : <Bookmark size={16} />}
        </button>
      </div>
      <p className="text-sm text-slate-600 mt-2 flex-1">{article.summary}</p>
      <div className="flex items-center justify-between gap-2 mt-3">
        <button className="btn-primary text-sm py-1.5 px-3" onClick={onOpen}>
          <BookOpen size={14} /> Read
        </button>
        {isCustom && (
          <div className="flex gap-1">
            <button className="btn-ghost text-xs" onClick={onEdit} aria-label="Edit"><Pencil size={12} /></button>
            <button className="btn-ghost text-xs text-rose-600 hover:bg-rose-50" onClick={onDelete} aria-label="Delete"><Trash2 size={12} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleModal({ article, isBookmarked, isRead, onClose, onBookmark, onMarkRead }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-3 md:p-6 bg-black/50"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="chip capitalize">{article.category}</span>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mt-2">{article.title}</h2>
            <div className="text-xs text-slate-500 mt-1 inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> {article.readMinutes} min read
              </span>
              {(article.tags || []).slice(0, 4).map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <button className="btn-ghost p-2" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="text-slate-600 italic mt-2">{article.summary}</p>
        <div className="mt-4 space-y-3 text-slate-700 leading-relaxed">
          {(article.paragraphs || []).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-100 pt-4">
          <button className="btn-secondary" onClick={onBookmark}>
            {isBookmarked ? <><BookmarkCheck size={16} /> Saved</> : <><Bookmark size={16} /> Save</>}
          </button>
          {!isRead && (
            <button className="btn-primary" onClick={onMarkRead}>
              <Check size={16} /> Mark as read
            </button>
          )}
          {isRead && (
            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-sage-100 text-sage-700 text-sm font-medium">
              <Check size={16} /> Already read
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleEditor({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(
    initial || {
      title: '',
      category: 'mindfulness',
      readMinutes: 3,
      summary: '',
      paragraphs: '',
      tags: '',
    }
  );

  const paragraphsStr =
    typeof form.paragraphs === 'string'
      ? form.paragraphs
      : (form.paragraphs || []).join('\n\n');

  const tagsStr =
    typeof form.tags === 'string' ? form.tags : (form.tags || []).join(', ');

  function save() {
    if (!form.title.trim()) return;
    onSave({
      id: initial?.id || slugify(form.title),
      title: form.title.trim(),
      category: form.category,
      readMinutes: Number(form.readMinutes) || 3,
      summary: form.summary.trim(),
      paragraphs: paragraphsStr.split('\n\n').map((p) => p.trim()).filter(Boolean),
      tags: tagsStr.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    });
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">{initial ? 'Edit entry' : 'New encyclopedia entry'}</h3>
        <button className="btn-ghost" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Title *</label>
          <input className="input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Category</label>
          <select className="input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {LIBRARY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Read time (min)</label>
          <input
            type="number"
            min="1"
            className="input mt-1"
            value={form.readMinutes}
            onChange={(e) => setForm({ ...form, readMinutes: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Tags (comma-separated)</label>
          <input
            className="input mt-1"
            placeholder="e.g. sleep, evening, science"
            value={tagsStr}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Summary (1-2 sentences)</label>
          <textarea
            className="input mt-1"
            rows={2}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Body — separate paragraphs with a blank line</label>
          <textarea
            className="input mt-1"
            rows={8}
            value={paragraphsStr}
            onChange={(e) => setForm({ ...form, paragraphs: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={!form.title.trim()}>
          <Save size={16} /> Save entry
        </button>
      </div>
    </div>
  );
}

/* ---------------- SWOT ---------------- */

const SWOT_QUADRANTS = [
  {
    key: 'strengths',
    title: 'Strengths',
    blurb: 'What you do well. Internal advantages.',
    icon: TrendingUp,
    accent: 'bg-sage-50 border-sage-200',
    chip: 'text-sage-700',
  },
  {
    key: 'weaknesses',
    title: 'Weaknesses',
    blurb: 'Where you struggle. Internal gaps to work on.',
    icon: AlertTriangle,
    accent: 'bg-rose-50 border-rose-200',
    chip: 'text-rose-700',
  },
  {
    key: 'opportunities',
    title: 'Opportunities',
    blurb: 'External openings you can act on.',
    icon: Compass,
    accent: 'bg-mist-50 border-mist-200',
    chip: 'text-mist-700',
  },
  {
    key: 'threats',
    title: 'Threats',
    blurb: 'External risks to plan around.',
    icon: Target,
    accent: 'bg-amber-50 border-amber-200',
    chip: 'text-amber-700',
  },
];

function SWOT() {
  const [swot, setSwot] = useLocalStorage('ht.swot', {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    updatedAt: null,
  });

  const total =
    swot.strengths.length +
    swot.weaknesses.length +
    swot.opportunities.length +
    swot.threats.length;

  function addItem(key, text) {
    if (!text.trim()) return;
    setSwot((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        { id: `${key}-${Date.now()}`, text: text.trim() },
      ],
      updatedAt: Date.now(),
    }));
  }

  function removeItem(key, id) {
    setSwot((prev) => ({
      ...prev,
      [key]: prev[key].filter((i) => i.id !== id),
      updatedAt: Date.now(),
    }));
  }

  function editItem(key, id, text) {
    setSwot((prev) => ({
      ...prev,
      [key]: prev[key].map((i) => (i.id === id ? { ...i, text } : i)),
      updatedAt: Date.now(),
    }));
  }

  return (
    <div className="card mb-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">My SWOT</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            A living self-portrait. Revisit it monthly. {total > 0 && swot.updatedAt && (
              <span className="text-xs">
                Last updated {new Date(swot.updatedAt).toLocaleDateString()}.
              </span>
            )}
          </p>
        </div>
        <span className="chip">{total} items</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SWOT_QUADRANTS.map((q) => (
          <SwotQuadrant
            key={q.key}
            quadrant={q}
            items={swot[q.key]}
            onAdd={(text) => addItem(q.key, text)}
            onRemove={(id) => removeItem(q.key, id)}
            onEdit={(id, text) => editItem(q.key, id, text)}
          />
        ))}
      </div>
    </div>
  );
}

function SwotQuadrant({ quadrant, items, onAdd, onRemove, onEdit }) {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const Icon = quadrant.icon;

  return (
    <div className={`rounded-2xl border ${quadrant.accent} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={quadrant.chip} />
        <h3 className={`font-semibold ${quadrant.chip}`}>{quadrant.title}</h3>
      </div>
      <p className="text-xs text-slate-600 mb-3">{quadrant.blurb}</p>

      <ul className="space-y-1.5 mb-3">
        {items.length === 0 && (
          <li className="text-xs text-slate-400 italic">Nothing yet — add one below.</li>
        )}
        {items.map((item) =>
          editingId === item.id ? (
            <li key={item.id} className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onEdit(item.id, editText.trim() || item.text);
                    setEditingId(null);
                  }
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
              <button
                className="btn-primary text-xs px-2"
                onClick={() => {
                  onEdit(item.id, editText.trim() || item.text);
                  setEditingId(null);
                }}
              >
                <Save size={12} />
              </button>
            </li>
          ) : (
            <li
              key={item.id}
              className="bg-white/70 rounded-lg px-3 py-2 text-sm text-slate-700 flex items-start gap-2 group"
            >
              <span className="flex-1">{item.text}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-slate-400 hover:text-slate-700"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditText(item.text);
                  }}
                  aria-label="Edit"
                >
                  <Pencil size={12} />
                </button>
                <button
                  className="text-slate-400 hover:text-rose-500"
                  onClick={() => onRemove(item.id)}
                  aria-label="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          )
        )}
      </ul>

      <div className="flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder={`Add a ${quadrant.title.toLowerCase().slice(0, -1)}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAdd(text);
              setText('');
            }
          }}
        />
        <button
          className="btn-primary text-sm px-3"
          onClick={() => {
            onAdd(text);
            setText('');
          }}
          disabled={!text.trim()}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
