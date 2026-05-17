# Health Tracker

A personal, all-in-one health tracking web app. Track water, green tea, food, supplements, protein, skincare, and haircare — all in one calm, friendly interface.

## What it tracks

1. Water intake (glasses / ml, daily goal, 7-day chart)
2. Green tea (cups, daily goal, 7-day chart)
3. Daily food log (meal-by-meal, auto macros from a curated database)
4. Supplements (check off daily, streak counter)
5. Protein intake (auto from food log + quick-add, daily goal, 7-day chart)
6. Weight-loss friendly foods (filterable, with reasons why)
7. Food benefits (browsable / searchable database)
8. Skincare routine (morning + night, customizable, streaks)
9. Haircare routine (frequency-aware weekly steps)

A **Dashboard** home page summarizes your day at a glance.

## Run it

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
cd health-tracker
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

To build a production version:

```bash
npm run build
npm run preview
```

## How your data is stored

All data lives in your browser's **localStorage**. That means:

- Data persists across page reloads and browser restarts on the same device.
- Data is **per-browser**: if you open the app in a different browser or device, you'll start fresh.
- Clearing your browser site data will erase your logs.
- No data ever leaves your computer — there is no backend, no account, no cloud sync.

Each tracker is keyed by date (`YYYY-MM-DD`), so today's log resets at midnight automatically while past days remain visible in the 7-day history.

## Extending the food database

The food list lives in `src/data/foods.js`. To add a new food, append a new object to the `foods` array with a unique `id`. The Food Log, Weight-Loss, and Food Benefits pages all read from this same source.

## Tech

- React 18 + Vite 5
- Tailwind CSS for styling
- React Router for navigation
- Recharts for 7-day charts
- Lucide for icons
- Plain JavaScript — no TypeScript, no test framework, no backend
