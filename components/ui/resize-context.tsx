import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";

interface ResizeContextType {
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
  activeResizable: string | null;
  setActiveResizable: (id: string | null) => void;
  registerResizeHandlers: (
    id: string,
    handlers: {
      onMove: (e: MouseEvent) => void;
      onEnd: () => void;
    }
  ) => void;
  unregisterResizeHandlers: (id: string) => void;
}

const ResizeContext = createContext<ResizeContextType | null>(null);

export function ResizeProvider({ children }: { children: React.ReactNode }) {
  const [isResizing, setIsResizing] = useState(false);
  const [activeResizable, setActiveResizable] = useState<string | null>(null);
  const [resizeHandlers, setResizeHandlers] = useState<
    Map<
      string,
      {
        onMove: (e: MouseEvent) => void;
        onEnd: () => void;
      }
    >
  >(new Map());

  const registerResizeHandlers = useCallback(
    (
      id: string,
      handlers: {
        onMove: (e: MouseEvent) => void;
        onEnd: () => void;
      }
    ) => {
      setResizeHandlers((prev) => new Map(prev).set(id, handlers));
    },
    []
  );

  const unregisterResizeHandlers = useCallback((id: string) => {
    setResizeHandlers((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !activeResizable) return;
      const handlers = resizeHandlers.get(activeResizable);
      if (handlers) {
        handlers.onMove(e);
      }
    },
    [isResizing, activeResizable, resizeHandlers]
  );

  const handleMouseUp = useCallback(() => {
    if (!activeResizable) return;
    const handlers = resizeHandlers.get(activeResizable);
    if (handlers) {
      handlers.onEnd();
    }
    setIsResizing(false);
    setActiveResizable(null);
  }, [activeResizable, resizeHandlers]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <ResizeContext.Provider
      value={{
        isResizing,
        setIsResizing,
        activeResizable,
        setActiveResizable,
        registerResizeHandlers,
        unregisterResizeHandlers,
      }}
    >
      {children}
    </ResizeContext.Provider>
  );
}

export function useResize() {
  const context = useContext(ResizeContext);
  if (!context) {
    throw new Error("useResize must be used within a ResizeProvider");
  }
  return context;
}
