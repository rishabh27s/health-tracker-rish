import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { foods as builtInFoods } from '../data/foods.js';

/**
 * useFoods — merges the built-in food database with user-added custom foods
 * stored in localStorage under `ht.foods.custom`. Custom entries with the same
 * `id` as a built-in override it.
 */
export function useFoods() {
  const [custom, setCustom] = useLocalStorage('ht.foods.custom', []);

  const foods = useMemo(() => {
    const customIds = new Set(custom.map((c) => c.id));
    return [
      ...builtInFoods.filter((f) => !customIds.has(f.id)),
      ...custom,
    ];
  }, [custom]);

  const findFood = useCallback(
    (id) => foods.find((f) => f.id === id),
    [foods]
  );

  const isCustom = useCallback(
    (id) => custom.some((c) => c.id === id),
    [custom]
  );

  const addFood = useCallback(
    (food) => {
      setCustom((prev) => [...prev.filter((c) => c.id !== food.id), food]);
    },
    [setCustom]
  );

  const removeFood = useCallback(
    (id) => {
      setCustom((prev) => prev.filter((c) => c.id !== id));
    },
    [setCustom]
  );

  return { foods, customFoods: custom, findFood, isCustom, addFood, removeFood };
}

export function slugify(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `food-${Date.now()}`
  );
}
