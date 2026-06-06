import { useState } from "react";

/**
 * useState backed by localStorage.
 * Reads the initial value from localStorage (falling back to `defaultValue`),
 * and keeps localStorage in sync on every set / clear.
 */
export default function useLocalStorageState(key, defaultValue = null) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  });

  const set = (next) => {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const clear = () => {
    setValue(defaultValue);
    localStorage.removeItem(key);
  };

  return [value, set, clear];
}
