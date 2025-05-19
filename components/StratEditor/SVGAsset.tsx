"use client";
import { useRef } from "react";
import { cn } from "@/src/utils";

interface SVGAssetProps {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onMouseDown: (e: React.MouseEvent, isResizeHandle: boolean) => void;
  selected: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function SVGAsset({
  id,
  position,
  size,
  onMouseDown,
  selected,
  children,
  className,
}: Readonly<SVGAssetProps>) {
  const assetRef = useRef<SVGGElement>(null);

  return (
    <g
      ref={assetRef}
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={(e) => onMouseDown(e, false)}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={cn("cursor-move select-none", className)}
    >
      <foreignObject
        width={size.width}
        height={size.height}
        style={{ overflow: "visible" }}
      >
        {children}
      </foreignObject>
      <rect
        x={0}
        y={0}
        width={size.width}
        height={size.height}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className={cn("pointer-events-none", !selected && "hidden")}
      />
      <circle
        cx={size.width}
        cy={size.height}
        r=".5%"
        fill="currentColor"
        className={cn("resize-handle cursor-se-resize", !selected && "hidden")}
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown(e, true);
        }}
      />
    </g>
  );
}
