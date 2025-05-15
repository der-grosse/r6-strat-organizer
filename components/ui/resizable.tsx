import React, {
  useRef,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import { useResize } from "./resize-context";

interface ResizableProps {
  children: React.ReactNode;
  boundingRef: React.RefObject<HTMLElement | null>;
  onResize?: (size: { width: number; height: number }) => void;
  size: { width: number; height: number }; // percentages (0-100)
  onSizeChange: (size: { width: number; height: number }) => void;
  minSize?: { width: number; height: number }; // percentages
  maxSize?: { width: number; height: number }; // percentages
  className?: string;
  style?: React.CSSProperties;
  id: string;
}

type ResizeDirection = "e" | "w" | "n" | "s" | "ne" | "nw" | "se" | "sw";

export default function Resizable({
  children,
  boundingRef,
  onResize,
  size,
  onSizeChange,
  minSize = { width: 10, height: 10 },
  maxSize = { width: 400, height: 400 },
  className,
  style,
  id,
}: Readonly<ResizableProps>) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const {
    isResizing,
    setIsResizing,
    activeResizable,
    setActiveResizable,
    registerResizeHandlers,
    unregisterResizeHandlers,
  } = useResize();
  const [resizeDirection, setResizeDirection] =
    useState<ResizeDirection | null>(null);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Convert pixels to percentage
  const pixelsToPercent = useCallback(
    (width: number, height: number) => {
      const bounding = boundingRef.current?.getBoundingClientRect();
      if (!bounding) return { width: 0, height: 0 };
      return {
        width: (width / bounding.width) * 100,
        height: (height / bounding.height) * 100,
      };
    },
    [boundingRef]
  );

  // Convert percentage to pixels
  const percentToPixels = useCallback(
    (width: number, height: number) => {
      const bounding = boundingRef.current?.getBoundingClientRect();
      if (!bounding) return { width: 0, height: 0 };
      return {
        width: (width / 100) * bounding.width,
        height: (height / 100) * bounding.height,
      };
    },
    [boundingRef]
  );

  // Clamp size to bounds
  const clampSize = useCallback(
    (width: number, height: number) => ({
      width: Math.min(Math.max(width, minSize.width), maxSize.width),
      height: Math.min(Math.max(height, minSize.height), maxSize.height),
    }),
    [minSize.width, minSize.height, maxSize.width, maxSize.height]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || activeResizable !== id || !resizeDirection) return;

      const bounding = boundingRef.current?.getBoundingClientRect();
      if (!bounding) return;

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      // Convert delta to percentages
      const deltaPercent = pixelsToPercent(Math.abs(deltaX), Math.abs(deltaY));

      let newWidth = startSize.width;
      let newHeight = startSize.height;

      // Calculate new dimensions based on resize direction
      if (resizeDirection.includes("e")) {
        newWidth = startSize.width + deltaPercent.width;
      } else if (resizeDirection.includes("w")) {
        newWidth = startSize.width - deltaPercent.width;
      }

      if (resizeDirection.includes("s")) {
        newHeight = startSize.height + deltaPercent.height;
      } else if (resizeDirection.includes("n")) {
        newHeight = startSize.height - deltaPercent.height;
      }

      // Clamp the new size
      const clampedSize = clampSize(newWidth, newHeight);
      onSizeChange(clampedSize);
    },
    [
      isResizing,
      activeResizable,
      id,
      resizeDirection,
      startPos,
      startSize,
      pixelsToPercent,
      clampSize,
      onSizeChange,
      boundingRef,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (activeResizable !== id) return;
    setResizeDirection(null);
    if (onResize) onResize(size);
  }, [activeResizable, id, onResize, size]);

  // Memoize the handlers object to prevent unnecessary re-renders
  const handlers = useMemo(() => {
    return {
      onMove: handleMouseMove,
      onEnd: handleMouseUp,
    };
  }, [handleMouseMove, handleMouseUp]);

  // Register resize handlers with context
  React.useEffect(() => {
    registerResizeHandlers(id, handlers);
    return () => unregisterResizeHandlers(id);
  }, [id, handlers]);

  const handleMouseDown = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();

    const bounding = boundingRef.current?.getBoundingClientRect();
    if (!bounding) return;

    setIsResizing(true);
    setActiveResizable(id);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize(size);
  };

  const resizeHandleStyle: React.CSSProperties = {
    position: "absolute",
    backgroundColor: "transparent",
    zIndex: 10,
  };

  return (
    <div
      ref={nodeRef}
      className={className}
      style={{
        position: "relative",
        width: `${size.width}%`,
        height: `${size.height}%`,
        ...style,
      }}
    >
      {children}

      {/* Resize handles */}
      <div
        style={{
          ...resizeHandleStyle,
          right: 0,
          top: 0,
          bottom: 0,
          width: "8px",
          cursor: "e-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "e")}
      />
      <div
        style={{
          ...resizeHandleStyle,
          left: 0,
          top: 0,
          bottom: 0,
          width: "8px",
          cursor: "w-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "w")}
      />
      <div
        style={{
          ...resizeHandleStyle,
          left: 0,
          right: 0,
          top: 0,
          height: "8px",
          cursor: "n-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "n")}
      />
      <div
        style={{
          ...resizeHandleStyle,
          left: 0,
          right: 0,
          bottom: 0,
          height: "8px",
          cursor: "s-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "s")}
      />
      <div
        style={{
          ...resizeHandleStyle,
          right: 0,
          top: 0,
          width: "8px",
          height: "8px",
          cursor: "ne-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "ne")}
      />
      <div
        style={{
          ...resizeHandleStyle,
          left: 0,
          top: 0,
          width: "8px",
          height: "8px",
          cursor: "nw-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "nw")}
      />
      <div
        style={{
          ...resizeHandleStyle,
          right: 0,
          bottom: 0,
          width: "8px",
          height: "8px",
          cursor: "se-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "se")}
      />
      <div
        style={{
          ...resizeHandleStyle,
          left: 0,
          bottom: 0,
          width: "8px",
          height: "8px",
          cursor: "sw-resize",
        }}
        onMouseDown={(e) => handleMouseDown(e, "sw")}
      />
    </div>
  );
}
