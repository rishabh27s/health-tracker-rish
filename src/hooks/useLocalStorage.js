import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage — persists state to window.localStorage under `key`.
 * Falls back to `initialValue` if nothing is stored or parsing fails.
 */
export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`useLocalStorage: failed to read ${key}`, err);
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = useState(readValue);

  // Persist on change
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`useLocalStorage: failed to write ${key}`, err);
    }
  }, [key, value]);

  // Cross-tab sync
  useEffect(() => {
    function onStorage(e) {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setValue];
}

/** Returns YYYY-MM-DD for a date (defaults to today, local time). */
export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns array of last N date keys, oldest first, ending today. */
export function lastNDateKeys(n = 7) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}

/** Format YYYY-MM-DD into a short label like "Mon" or "Apr 28". */
export function shortDay(key) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: 'short' });
}
