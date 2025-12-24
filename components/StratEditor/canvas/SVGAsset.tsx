"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface SVGAssetProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  onMouseDown: (
    e: React.MouseEvent,
    handle: "resize" | "rotate" | "none"
  ) => void;
  selected: boolean;
  children: React.ReactNode;
  ctrlKeyDown?: boolean;
  menu?: React.ReactNode;
  zoom: number;
  readonly?: boolean;
}

export default function SVGAsset({
  position,
  size,
  rotation,
  onMouseDown,
  selected,
  children,
  ctrlKeyDown = false,
  menu,
  zoom,
  readonly,
}: Readonly<SVGAssetProps>) {
  const assetRef = useRef<SVGGElement>(null);

  return (
    <g
      ref={assetRef}
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={(e) => onMouseDown(e, "none")}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={cn(!readonly && "select-none")}
    >
      <g
        transform={`rotate(${rotation} ${size.width / 2} ${size.height / 2})`}
        className={cn(!readonly && "cursor-move")}
      >
        <foreignObject
          width={size.width}
          height={size.height}
          style={{
            overflow: "visible",
            zIndex: 1,
          }}
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
          filter="url(#globalDropShadow)"
          className={cn("pointer-events-none", !selected && "hidden")}
        />
        <circle
          cx={size.width * 1.025}
          cy={size.height * 1.025}
          r=".75%"
          fill="transparent"
          className={cn(
            "rotate-handle",
            !selected && "hidden",
            !readonly && "cursor-[url(/cursor/rotate.png),_grab]"
          )}
          onMouseDown={(e) => {
            e.stopPropagation();
            onMouseDown(e, "rotate");
          }}
        />
        <circle
          cx={size.width}
          cy={size.height}
          r=".5%"
          fill="currentColor"
          filter="url(#globalDropShadow)"
          className={cn(
            "resize-handle",
            !selected && "hidden",
            !readonly &&
              (ctrlKeyDown
                ? "cursor-[url(/cursor/rotate.png),_grab]"
                : "cursor-se-resize")
          )}
          onMouseDown={(e) => {
            e.stopPropagation();
            onMouseDown(e, "resize");
          }}
        />
      </g>
      {menu && (
        <foreignObject
          style={{ overflow: "visible" }}
          // matrix(sx, 0, 0, sy, cx-sx*cx, cy-sy*cy) -> to scale with a transform origin at the center bottom
          transform={`matrix(${zoom}, 0, 0, ${zoom}, ${
            size.width / 2 - (size.width / 2) * zoom
          }, 0) translate(${size.width / 2} ${
            -size.height * (1 - zoom)
          }) translate(0, ${
            // Adjust the vertical position based on rotation
            (rotation === 0
              ? 0
              : (() => {
                  const diagonalHalf = Math.sqrt(
                    Math.pow(size.width / 2, 2) + Math.pow(size.height / 2, 2)
                  );
                  const normalizedRotation = Math.abs(rotation % 90);
                  const radians = (normalizedRotation * Math.PI) / 180;

                  const baseAngle = Math.atan2(size.height, size.width);
                  const rotatedAngle = baseAngle + radians;
                  const offset =
                    diagonalHalf * Math.sin(rotatedAngle) - size.height / 2;

                  return -Math.max(0, offset);
                })()) - 15
          })`}
        >
          {menu}
        </foreignObject>
      )}
    </g>
  );
}
