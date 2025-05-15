import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";

interface DragContextType {
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  activeDraggable: string | null;
  setActiveDraggable: (id: string | null) => void;
  registerDragHandlers: (
    id: string,
    handlers: {
      onMove: (e: MouseEvent | TouchEvent) => void;
      onEnd: () => void;
    }
  ) => void;
  unregisterDragHandlers: (id: string) => void;
}

const DragContext = createContext<DragContextType | null>(null);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeDraggable, setActiveDraggable] = useState<string | null>(null);
  const [dragHandlers, setDragHandlers] = useState<
    Map<
      string,
      {
        onMove: (e: MouseEvent | TouchEvent) => void;
        onEnd: () => void;
      }
    >
  >(new Map());

  const registerDragHandlers = useCallback(
    (
      id: string,
      handlers: {
        onMove: (e: MouseEvent | TouchEvent) => void;
        onEnd: () => void;
      }
    ) => {
      setDragHandlers((prev) => new Map(prev).set(id, handlers));
    },
    []
  );

  const unregisterDragHandlers = useCallback((id: string) => {
    setDragHandlers((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !activeDraggable) return;
      const handlers = dragHandlers.get(activeDraggable);
      if (handlers) {
        handlers.onMove(e);
      }
    },
    [isDragging, activeDraggable, dragHandlers]
  );

  const handleMouseUp = useCallback(() => {
    if (!activeDraggable) return;
    const handlers = dragHandlers.get(activeDraggable);
    if (handlers) {
      handlers.onEnd();
    }
    setIsDragging(false);
    setActiveDraggable(null);
  }, [activeDraggable, dragHandlers]);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !activeDraggable) return;
      const handlers = dragHandlers.get(activeDraggable);
      if (handlers) {
        handlers.onMove(e);
      }
    },
    [isDragging, activeDraggable, dragHandlers]
  );

  const handleTouchEnd = useCallback(() => {
    if (!activeDraggable) return;
    const handlers = dragHandlers.get(activeDraggable);
    if (handlers) {
      handlers.onEnd();
    }
    setIsDragging(false);
    setActiveDraggable(null);
  }, [activeDraggable, dragHandlers]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <DragContext.Provider
      value={{
        isDragging,
        setIsDragging,
        activeDraggable,
        setActiveDraggable,
        registerDragHandlers,
        unregisterDragHandlers,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDrag must be used within a DragProvider");
  }
  return context;
}
