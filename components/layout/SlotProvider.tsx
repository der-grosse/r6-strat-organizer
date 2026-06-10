"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";

interface SlotContextType {
  slots: Record<string, ReactNode>;
  setSlot: (name: string, content: ReactNode) => void;
  getSlot: (name: string) => ReactNode;
  clearSlot: (name: string) => void;
}

const SlotContext = createContext<SlotContextType | null>(null);

export function SlotProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<Record<string, ReactNode>>({});

  const setSlot = useCallback((name: string, content: ReactNode) => {
    setSlots((prev) => ({ ...prev, [name]: content }));
  }, []);

  const getSlot = useCallback((name: string) => slots[name] || null, [slots]);

  const clearSlot = useCallback((name: string) => {
    setSlots((prev) => {
      const newSlots = { ...prev };
      delete newSlots[name];
      return newSlots;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      slots,
      setSlot,
      getSlot,
      clearSlot,
    }),
    [slots, setSlot, getSlot, clearSlot],
  );

  return <SlotContext.Provider value={contextValue}>{children}</SlotContext.Provider>;
}

export function useSlots() {
  const context = useContext(SlotContext);
  if (!context) {
    throw new Error("useSlots must be used within SlotProvider");
  }
  return context;
}
