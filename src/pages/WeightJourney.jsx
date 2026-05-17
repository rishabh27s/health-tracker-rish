import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  Scale,
  Target,
  Flag,
  CalendarDays,
  Plus,
  Trash2,
  Settings2,
} from 'lucide-react';
import { useLocalStorage, dateKey } from '../hooks/useLocalStorage.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

const DEFAULT_START = 104;
const DEFAULT_GOAL = 75;

export default function WeightJourney() {
  const today = dateKey();

  const [start, setStart] = useLocalStorage('ht.weight.start', DEFAULT_START);
  const [goal, setGoal] = useLocalStorage('ht.weight.goal', DEFAULT_GOAL);
  const [unit, setUnit] = useLocalStorage('ht.weight.unit', 'kg');
  const [entries, setEntries] = useLocalStorage('ht.weight.entries', []);
  const [showSettings, setShowSettings] = useState(false);

  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
    [entries]
  );

  const current = sorted.length ? sorted[sorted.length - 1].weight : start;
  const lost = +(start - current).toFixed(1);
  const toGoal = +(current - goal).toFixed(1);
  const totalToLose = Math.max(0.1, start - goal);
  const pctToGoal = Math.max(0, Math.min(100, ((start - current) / totalToLose) * 100));

  // Linear regression slope: kg per day
  const stats = useMemo(() => {
    if (sorted.length < 2) return null;
    const t0 = new Date(sorted[0].date).getTime();
    const xs = sorted.map((e) => (new Date(e.date).getTime() - t0) / (1000 * 60 * 60 * 24));
    const ys = sorted.map((e) => e.weight);
    const n = xs.length;
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
    const sumX2 = xs.reduce((s, x) => s + x * x, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;
    const slopePerDay = (n * sumXY - sumX * sumY) / denom; // kg/day (negative if losing)
    const slopePerWeek = slopePerDay * 7;
    const daysSpan = xs[xs.length - 1] - xs[0] || 1;
    const avgPerWeek = ((ys[0] - ys[ys.length - 1]) / daysSpan) * 7;

    // Projection — when will user hit goal at current slope?
    let projection = null;
    if (slopePerDay < 0 && current > goal) {
      const daysToGoal = (current - goal) / -slopePerDay;
      const eta = new Date();
      eta.setDate(eta.getDate() + Math.round(daysToGoal));
      projection = {
        days: Math.round(daysToGoal),
        date: eta.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    }
    return { slopePerWeek, avgPerWeek, daysSpan: Math.round(daysSpan), projection };
  }, [sorted, current, goal]);

  function addEntry() {
    const w = Number(weight);
    if (!Number.isFinite(w) || w <= 0) return;
    setEntries((prev) => {
      const without = prev.filter((e) => e.date !== date);
      return [...without, { date, weight: +w.toFixed(1) }].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    });
    setWeight('');
  }

  function removeEntry(d) {
    setEntries((prev) => prev.filter((e) => e.date !== d));
  }

  // Chart data — include the start as an anchor point if it predates the first entry
  const chartData = useMemo(() => {
    return sorted.map((e) => ({
      date: e.date,
      label: shortLabel(e.date),
      weight: e.weight,
    }));
  }, [sorted]);

  const yMin = Math.floor(Math.min(goal, current, ...sorted.map((e) => e.weight), start) - 2);
  const yMax = Math.ceil(Math.max(start, current, ...sorted.map((e) => e.weight)) + 2);

  return (
    <div>
      <PageHeader
        title="Weight Journey"
        subtitle="Track your weight over time and watch the trend bend."
        action={
          <button className="btn-secondary" onClick={() => setShowSettings((s) => !s)}>
            <Settings2 size={16} /> Settings
          </button>
        }
      />

      {showSettings && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-600">Starting weight ({unit})</label>
              <input
                type="number"
                step="0.1"
                className="input mt-1"
                value={start}
                onChange={(e) => setStart(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Goal weight ({unit})</label>
              <input
                type="number"
                step="0.1"
                className="input mt-1"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Unit</label>
              <select
                className="input mt-1"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          icon={Flag}
          label="Starting"
          value={`${start} ${unit}`}
          sub="your baseline"
          accent="rose"
        />
        <StatCard
          icon={Scale}
          label="Current"
          value={`${current} ${unit}`}
          sub={sorted.length ? `as of ${shortLabel(sorted[sorted.length - 1].date)}` : 'no entries yet'}
          accent="mist"
        />
        <StatCard
          icon={TrendingDown}
          label="Lost so far"
          value={`${lost > 0 ? '-' : ''}${Math.abs(lost)} ${unit}`}
          sub={lost > 0 ? 'good progress' : 'log your first entry'}
          accent="sage"
        />
        <StatCard
          icon={Target}
          label="To goal"
          value={`${Math.max(0, toGoal)} ${unit}`}
          sub={`goal: ${goal} ${unit}`}
          accent="violet"
        />
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600">Progress to goal</span>
          <span className="font-medium text-slate-800">{pctToGoal.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage-400 to-sage-600 transition-all"
            style={{ width: `${pctToGoal}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <span>{start} {unit}</span>
          <span>{goal} {unit}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Add entry */}
        <div className="card lg:col-span-1">
          <h2 className="font-semibold text-slate-800 mb-3">Log a weigh-in</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Date</label>
              <input
                type="date"
                className="input mt-1"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Weight ({unit})</label>
              <input
                type="number"
                step="0.1"
                className="input mt-1"
                placeholder={`${current}`}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEntry()}
              />
            </div>
            <button className="btn-primary w-full" onClick={addEntry} disabled={!weight}>
              <Plus size={16} /> Save weigh-in
            </button>
            <p className="text-xs text-slate-500">
              Tip: weigh yourself at the same time each morning for the most consistent trend.
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-800">Trend</h2>
            <span className="text-xs text-slate-500">{unit} over time</span>
          </div>
          {chartData.length === 0 ? (
            <EmptyState
              icon={TrendingDown}
              title="No weigh-ins yet"
              message={`Log your first entry on the left. Your starting weight is ${start} ${unit}.`}
            />
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 12, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(v) => [`${v} ${unit}`, 'Weight']}
                  />
                  <ReferenceLine
                    y={goal}
                    stroke="#7c3aed"
                    strokeDasharray="4 4"
                    label={{ value: `Goal ${goal}`, fontSize: 11, fill: '#7c3aed', position: 'right' }}
                  />
                  <ReferenceLine
                    y={start}
                    stroke="#cbd5e1"
                    strokeDasharray="2 4"
                    label={{ value: `Start ${start}`, fontSize: 11, fill: '#94a3b8', position: 'right' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#52885b"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#52885b' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Slope / projection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={TrendingDown}
          label="Trend slope"
          value={
            stats
              ? `${stats.slopePerWeek > 0 ? '+' : ''}${stats.slopePerWeek.toFixed(2)} ${unit}/wk`
              : '—'
          }
          sub={stats ? 'linear regression on all entries' : 'need 2+ entries'}
          accent="sage"
        />
        <StatCard
          icon={CalendarDays}
          label="Days tracked"
          value={stats ? stats.daysSpan : sorted.length}
          sub={`${sorted.length} weigh-in${sorted.length === 1 ? '' : 's'} logged`}
          accent="mist"
        />
        <StatCard
          icon={Target}
          label="Goal ETA"
          value={stats?.projection ? stats.projection.date : '—'}
          sub={
            stats?.projection
              ? `~${stats.projection.days} days at current pace`
              : stats
              ? 'losing pace needed for ETA'
              : 'log more entries'
          }
          accent="violet"
        />
      </div>

      {/* Entry history */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-3">All weigh-ins</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">No entries yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Weight</th>
                  <th className="text-left px-4 py-2 font-medium">Δ from start</th>
                  <th className="text-right px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((e) => {
                  const delta = +(e.weight - start).toFixed(1);
                  return (
                    <tr key={e.date} className="border-t border-slate-100">
                      <td className="px-4 py-2 text-slate-700">{longLabel(e.date)}</td>
                      <td className="px-4 py-2 font-medium text-slate-800">
                        {e.weight} {unit}
                      </td>
                      <td className={`px-4 py-2 ${delta < 0 ? 'text-sage-700' : delta > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                        {delta > 0 ? '+' : ''}
                        {delta} {unit}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          className="btn-ghost text-rose-600 hover:bg-rose-50"
                          onClick={() => removeEntry(e.date)}
                          aria-label={`Delete entry for ${e.date}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function shortLabel(d) {
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(y, m - 1, day);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function longLabel(d) {
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(y, m - 1, day);
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
