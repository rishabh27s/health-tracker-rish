import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Leaf,
  Beef,
  Flame,
  Pill,
  Sparkles,
  UtensilsCrossed,
  ArrowRight,
  Calendar,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { useLocalStorage, dateKey } from '../hooks/useLocalStorage.js';
import { useFoods } from '../hooks/useFoods.js';
import { useStartDate } from '../hooks/useStartDate.js';
import { defaultSupplements } from '../data/supplements.js';
import { defaultMorningRoutine, defaultNightRoutine } from '../data/skincare.js';
import StatCard from '../components/StatCard.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function Dashboard() {
  const today = dateKey();
  const { findFood } = useFoods();
  const { startDate, setStartDate, hasStarted, daysUntil } = useStartDate();
  const [editingDate, setEditingDate] = useState(false);
  const [draftDate, setDraftDate] = useState(startDate);
  const [waterLog] = useLocalStorage('ht.water.log', {});
  const [waterGoal] = useLocalStorage('ht.water.goal', 2500);
  const [teaLog] = useLocalStorage('ht.greenTea.log', {});
  const [teaGoal] = useLocalStorage('ht.greenTea.goal', 3);
  const [foodLog] = useLocalStorage('ht.food.log', {});
  const [proteinManual] = useLocalStorage('ht.protein.manual', {});
  const [proteinGoal] = useLocalStorage('ht.protein.goal', 100);
  const [supplements] = useLocalStorage('ht.supplements.list', defaultSupplements);
  const [supplementsLog] = useLocalStorage('ht.supplements.log', {});
  const [morning] = useLocalStorage('ht.skincare.morning', defaultMorningRoutine);
  const [night] = useLocalStorage('ht.skincare.night', defaultNightRoutine);
  const [skincareLog] = useLocalStorage('ht.skincare.log', {});

  const water = waterLog[today] || 0;
  const tea = teaLog[today] || 0;

  const macros = useMemo(() => {
    const entries = foodLog[today] || [];
    let calories = 0, protein = 0;
    for (const e of entries) {
      const f = findFood(e.foodId);
      if (!f) continue;
      calories += f.calories * e.servings;
      protein += f.protein * e.servings;
    }
    const manual = (proteinManual[today] || []).reduce((s, e) => s + (Number(e.grams) || 0), 0);
    return {
      calories: Math.round(calories),
      protein: +(protein + manual).toFixed(1),
    };
  }, [foodLog, proteinManual, today, findFood]);

  const suppToday = supplementsLog[today] || {};
  const suppDone = Object.keys(suppToday).length;

  const skinToday = skincareLog[today] || {};
  const skinSteps = morning.length + night.length;
  const skinDone = Object.keys(skinToday).filter((k) => k.startsWith('am:') || k.startsWith('pm:')).length;

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greeting = `${timeOfDay}, Rishabh`;
  const subtitle = hasStarted
    ? `Here's your snapshot for ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.`
    : `Your tracking journey begins ${daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`} — a clean Day 1 awaits.`;

  return (
    <div>
      <PageHeader title={greeting} subtitle={subtitle} />

      <div className={`card mb-4 ${!hasStarted ? 'bg-gradient-to-r from-sage-50 to-mist-50 border-sage-200' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-500 text-white flex items-center justify-center shrink-0">
            {!hasStarted ? <Sparkles size={18} /> : <Calendar size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            {!hasStarted ? (
              <>
                <div className="font-semibold text-slate-800">Day 1: {longDate(startDate)}</div>
                <p className="text-sm text-slate-600 mt-0.5">
                  All trackers unlock on this date with fresh streaks and clean charts. Until then, browse the Mind Library, build your SWOT, and explore the food + weight-loss pages.
                </p>
              </>
            ) : (
              <>
                <div className="font-semibold text-slate-800">
                  Tracking since {longDate(startDate)}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                  Adjust your start date any time — useful if you want to push the journey to a fresh week or restart streaks.
                </p>
              </>
            )}

            {editingDate ? (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <input
                  type="date"
                  className="input max-w-[200px]"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                />
                <button
                  className="btn-primary text-sm"
                  onClick={() => {
                    if (draftDate) setStartDate(draftDate);
                    setEditingDate(false);
                  }}
                >
                  <Save size={14} /> Save
                </button>
                <button
                  className="btn-ghost text-sm"
                  onClick={() => {
                    setDraftDate(startDate);
                    setEditingDate(false);
                  }}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            ) : (
              <button
                className="btn-ghost text-xs mt-2 px-2"
                onClick={() => {
                  setDraftDate(startDate);
                  setEditingDate(true);
                }}
              >
                <Pencil size={12} /> Change start date
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <RingCard
          to="/water"
          color="#3f6c8a"
          track="#e6eff5"
          icon={Droplets}
          accent="mist"
          title="Water"
          value={water}
          max={waterGoal}
          label={`${water}`}
          sublabel={`/ ${waterGoal} ml`}
        />
        <RingCard
          to="/green-tea"
          color="#52885b"
          track="#e3eee5"
          icon={Leaf}
          accent="sage"
          title="Green Tea"
          value={tea}
          max={teaGoal}
          label={`${tea}`}
          sublabel={`/ ${teaGoal} cups`}
        />
        <RingCard
          to="/protein"
          color="#7c3aed"
          track="#ede9fe"
          icon={Beef}
          accent="violet"
          title="Protein"
          value={macros.protein}
          max={proteinGoal}
          label={`${macros.protein}g`}
          sublabel={`/ ${proteinGoal}g`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon={Flame} label="Calories today" value={macros.calories} sub="from food log" accent="amber" />
        <StatCard
          icon={UtensilsCrossed}
          label="Items logged"
          value={(foodLog[today] || []).length}
          sub="meals + snacks"
          accent="sage"
        />
        <StatCard
          icon={Pill}
          label="Supplements"
          value={`${suppDone} / ${supplements.length}`}
          sub="taken today"
          accent="rose"
        />
        <StatCard
          icon={Sparkles}
          label="Skincare"
          value={`${skinDone} / ${skinSteps}`}
          sub="steps done"
          accent="violet"
        />
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-2">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          <QuickLink to="/water">Log water</QuickLink>
          <QuickLink to="/green-tea">Log tea</QuickLink>
          <QuickLink to="/food-log">Log food</QuickLink>
          <QuickLink to="/supplements">Check supplements</QuickLink>
          <QuickLink to="/skincare">Skincare</QuickLink>
          <QuickLink to="/haircare">Haircare</QuickLink>
          <QuickLink to="/weight-journey">Weight journey</QuickLink>
          <QuickLink to="/weight-loss">Weight-loss foods</QuickLink>
          <QuickLink to="/dry-fruits">Dry fruits</QuickLink>
          <QuickLink to="/superfoods">Superfoods</QuickLink>
          <QuickLink to="/yoga">Yoga & meditation</QuickLink>
          <QuickLink to="/library">Mind library</QuickLink>
          <QuickLink to="/my-foods">My foods</QuickLink>
          <QuickLink to="/food-benefits">Food benefits</QuickLink>
        </div>
      </div>
    </div>
  );
}

function RingCard({ to, color, track, icon: Icon, accent, title, value, max, label, sublabel }) {
  const accentMap = {
    sage: 'bg-sage-100 text-sage-700',
    mist: 'bg-mist-100 text-mist-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  return (
    <Link to={to} className="card hover:shadow-md transition-shadow flex items-center gap-4">
      <ProgressRing value={value} max={max} size={110} stroke={10} color={color} trackColor={track} label={label} sublabel={sublabel} />
      <div className="flex-1 min-w-0">
        <div className={`inline-flex w-9 h-9 rounded-xl items-center justify-center ${accentMap[accent] || accentMap.sage}`}>
          <Icon size={18} />
        </div>
        <div className="mt-2 font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-500 inline-flex items-center gap-1">
          Open tracker <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}

function longDate(d) {
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(y, m - 1, day);
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function QuickLink({ to, children }) {
  return (
    <Link to={to} className="px-3 py-2 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-700 text-sm font-medium border border-sage-100">
      {children}
    </Link>
  );
}
