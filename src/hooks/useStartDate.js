import { useLocalStorage, dateKey } from './useLocalStorage.js';

function tomorrowKey() {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return dateKey(t);
}

/**
 * useStartDate — the date (YYYY-MM-DD) on which daily tracking officially begins.
 * Defaults to tomorrow (relative to first run) and persists thereafter.
 */
export function useStartDate() {
  const [startDate, setStartDate] = useLocalStorage('ht.startDate', tomorrowKey());
  const today = dateKey();
  const hasStarted = today >= startDate;
  const daysUntil = daysBetween(today, startDate);
  return { startDate, setStartDate, hasStarted, daysUntil, today };
}

function daysBetween(from, to) {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const a = new Date(fy, fm - 1, fd);
  const b = new Date(ty, tm - 1, td);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}
