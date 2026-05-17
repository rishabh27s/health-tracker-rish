import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

/**
 * useTheme — persists 'light' or 'dark' to localStorage and applies the `dark`
 * class on <html>. Defaults to the user's OS preference on first run.
 */
function initialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('ht.theme');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      /* ignore */
    }
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('ht.theme', initialTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [setTheme]
  );

  return { theme, setTheme, toggle };
}
