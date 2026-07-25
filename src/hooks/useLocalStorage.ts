import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for typed localStorage access with automatic JSON parsing.
 * Returns current value and setter. Handles SSR gracefully.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch {
      // Use default value on error
    }
  }, [key]);

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`Failed to save ${key} to localStorage`);
    }
  }, [key]);

  return [storedValue, setValue];
}
