import React, { useRef, useCallback, useEffect } from "react";
import { useDrag } from "./draggable-context";

interface DraggableProps {
  children: React.ReactNode;
  boundingRef: React.RefObject<HTMLElement | null>;
  onDrop?: (position: { x: number; y: number }) => void;
  position: { x: number; y: number }; // Now represents percentages (0-100)
  onPositionChange: (position: { x: number; y: number }) => void;
  id: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Draggable({
  children,
  boundingRef,
  onDrop,
  position,
  onPositionChange,
  id,
  className,
  style,
}: Readonly<DraggableProps>) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const {
    isDragging,
    setIsDragging,
    activeDraggable,
    setActiveDraggable,
    registerDragHandlers,
    unregisterDragHandlers,
  } = useDrag();
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  // Helper to get bounding box
  const getBounds = useCallback(() => {
    const bounding = boundingRef.current?.getBoundingClientRect();
    const node = nodeRef.current?.getBoundingClientRect();
    if (!bounding || !node) return null;
    return {
      minX: 0,
      minY: 0,
      maxX: 100 - (node.width / bounding.width) * 100,
      maxY: 100 - (node.height / bounding.height) * 100,
    };
  }, [boundingRef]);

  // Convert pixel position to percentage
  const pixelsToPercent = useCallback(
    (x: number, y: number) => {
      const bounding = boundingRef.current?.getBoundingClientRect();
      if (!bounding) return { x: 0, y: 0 };
      return {
        x: (x / bounding.width) * 100,
        y: (y / bounding.height) * 100,
      };
    },
    [boundingRef]
  );

  // Convert percentage to pixels
  const percentToPixels = useCallback(
    (x: number, y: number) => {
      const bounding = boundingRef.current?.getBoundingClientRect();
      if (!bounding) return { x: 0, y: 0 };
      return {
        x: (x / 100) * bounding.width,
        y: (y / 100) * bounding.height,
      };
    },
    [boundingRef]
  );

  // Clamp position to bounds
  const clamp = useCallback(
    (x: number, y: number) => {
      const bounds = getBounds();
      if (!bounds) return { x, y };
      return {
        x: Math.min(Math.max(x, bounds.minX), bounds.maxX),
        y: Math.min(Math.max(y, bounds.minY), bounds.maxY),
      };
    },
    [getBounds]
  );

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || activeDraggable !== id) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const bounding = boundingRef.current?.getBoundingClientRect();
      if (!bounding) return;

      // Calculate new position in pixels relative to the bounding box
      const newX = clientX - bounding.left - offset.x;
      const newY = clientY - bounding.top - offset.y;

      // Convert to percentage
      const percentPos = pixelsToPercent(newX, newY);

      // Clamp the percentage values
      const { x, y } = clamp(percentPos.x, percentPos.y);
      onPositionChange({ x, y });
    },
    [
      isDragging,
      activeDraggable,
      id,
      clamp,
      offset,
      onPositionChange,
      pixelsToPercent,
      boundingRef,
    ]
  );

  const handleEnd = useCallback(() => {
    if (activeDraggable !== id) return;
    if (onDrop) onDrop(position);
  }, [activeDraggable, id, onDrop, position]);

  // Register drag handlers with context
  useEffect(() => {
    registerDragHandlers(id, {
      onMove: handleMove,
      onEnd: handleEnd,
    });

    return () => {
      unregisterDragHandlers(id);
    };
  }, [id, handleMove, handleEnd, registerDragHandlers, unregisterDragHandlers]);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const bounding = boundingRef.current?.getBoundingClientRect();
    if (!bounding) return;

    setIsDragging(true);
    setActiveDraggable(id);

    // Calculate offset in pixels
    const currentPos = percentToPixels(position.x, position.y);
    setOffset({
      x: e.clientX - bounding.left - currentPos.x,
      y: e.clientY - bounding.top - currentPos.y,
    });
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const bounding = boundingRef.current?.getBoundingClientRect();
    if (!bounding) return;

    setIsDragging(true);
    setActiveDraggable(id);

    // Calculate offset in pixels
    const currentPos = percentToPixels(position.x, position.y);
    setOffset({
      x: touch.clientX - bounding.left - currentPos.x,
      y: touch.clientY - bounding.top - currentPos.y,
    });
  };

  // If bounding box changes, clamp position
  useEffect(() => {
    const { x, y } = clamp(position.x, position.y);
    if (x !== position.x || y !== position.y) {
      onPositionChange({ x, y });
    }
  }, [boundingRef.current, clamp, onPositionChange, position]);

  return (
    <div
      ref={nodeRef}
      className={className}
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)", // Center the element on its position
        touchAction: "none",
        cursor: isDragging && activeDraggable === id ? "grabbing" : "grab",
        ...style,
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {children}
    </div>
  );
}
