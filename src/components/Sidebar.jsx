import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplets,
  Leaf,
  UtensilsCrossed,
  Pill,
  Beef,
  Salad,
  TrendingDown,
  BookOpen,
  Sparkles,
  Scissors,
  Menu,
  X,
  HeartPulse,
  Nut,
  Sprout,
  ChefHat,
  Sun,
  Moon,
  Flower2,
  BookMarked,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme.js';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/water', label: 'Water', icon: Droplets },
  { to: '/green-tea', label: 'Green Tea', icon: Leaf },
  { to: '/food-log', label: 'Food Log', icon: UtensilsCrossed },
  { to: '/my-foods', label: 'My Foods', icon: ChefHat },
  { to: '/supplements', label: 'Supplements', icon: Pill },
  { to: '/dry-fruits', label: 'Dry Fruits', icon: Nut },
  { to: '/superfoods', label: 'Superfoods', icon: Sprout },
  { to: '/protein', label: 'Protein', icon: Beef },
  { to: '/weight-journey', label: 'Weight Journey', icon: TrendingDown },
  { to: '/weight-loss', label: 'Weight Loss Foods', icon: Salad },
  { to: '/food-benefits', label: 'Food Benefits', icon: BookOpen },
  { to: '/yoga', label: 'Yoga & Meditation', icon: Flower2 },
  { to: '/library', label: 'Mind Library', icon: BookMarked },
  { to: '/skincare', label: 'Skincare', icon: Sparkles },
  { to: '/haircare', label: 'Haircare', icon: Scissors },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sage-500 text-white flex items-center justify-center">
            <HeartPulse size={18} />
          </div>
          <span className="font-semibold text-slate-800">Health Tracker</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="btn-ghost p-2"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn-ghost p-2" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sage-500 text-white flex items-center justify-center">
                  <HeartPulse size={18} />
                </div>
                <span className="font-semibold">Health Tracker</span>
              </div>
              <button className="btn-ghost p-2" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <l.icon size={18} />
                  <span>{l.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-slate-100 bg-white">
        <div className="p-5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sage-500 text-white flex items-center justify-center">
            <HeartPulse size={20} />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Health Tracker</div>
            <div className="text-xs text-slate-500">Your daily wellness</div>
          </div>
        </div>
        <nav className="flex-1 px-3 pb-6 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <l.icon size={18} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400 px-2">Local-only data</span>
          <button
            className="btn-ghost text-xs px-2 py-1.5 inline-flex items-center gap-1.5"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </aside>
    </>
  );
}
