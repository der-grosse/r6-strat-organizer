"use client";
import { useCallback, useEffect, useRef } from "react";

export default function useSaveDebounced<T>(
  value: T,
  save: (value: T) => unknown | Promise<unknown>,
  options?: { delay?: number; onError?: (error: unknown) => void },
): {
  saveNow: (value?: T) => void;
} {
  const lastSavedValue = useRef<T>(value);
  const runSave = useCallback(
    (value: T) => {
      if (value === lastSavedValue.current) return;
      const previousValue = lastSavedValue.current;
      lastSavedValue.current = value; // Optimistically update to prevent multiple calls
      const res = save(value);
      if (res instanceof Promise) {
        res.catch((err) => {
          lastSavedValue.current = previousValue; // Revert on failure
          options?.onError?.(err);
        });
      }
    },
    [save],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSave(value);
    }, options?.delay ?? 1000);

    return () => clearTimeout(timeout);
  }, [value]);

  const saveNow = (newValue?: T) => {
    const toSave = newValue ?? value;
    runSave(toSave);
  };

  return { saveNow };
}
