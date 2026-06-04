"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// The menu's foreignObject must be large enough to contain the (2x scaled) menu
// in every browser. Firefox clips to these bounds, so they are intentionally
// generous; the box is non-interactive (pointerEvents: none) and only its
// content (the menu) receives pointer events.
const MENU_FO_WIDTH = 4000;
const MENU_FO_HEIGHT = 400;

interface SVGAssetProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  onMouseDown: (
    e: React.MouseEvent,
    handle: "resize" | "rotate" | "none",
  ) => void;
  onTouchStart: (
    e: React.TouchEvent,
    handle: "resize" | "rotate" | "none",
  ) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
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
  onTouchStart,
  onDoubleClick,
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
      onTouchStart={(e) => {
        e.stopPropagation();
        onTouchStart(e, "none");
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.(e);
      }}
      className={cn(!readonly && "select-none")}
      style={{ touchAction: "none" }}
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
          className={cn(
            "svg-selected-rect pointer-events-none",
            !selected && "hidden",
          )}
        />
        <circle
          cx={size.width * 1.025}
          cy={size.height * 1.025}
          r=".75%"
          fill="transparent"
          className={cn(
            "rotate-handle",
            !selected && "hidden",
            !readonly && "cursor-[url(/cursor/rotate.png),_grab]",
          )}
          onMouseDown={(e) => {
            e.stopPropagation();
            onMouseDown(e, "rotate");
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onTouchStart(e, "rotate");
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
                : "cursor-se-resize"),
          )}
          onMouseDown={(e) => {
            e.stopPropagation();
            onMouseDown(e, "resize");
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onTouchStart(e, "resize");
          }}
        />
      </g>
      {menu && (
        // Firefox does not paint content that overflows a 0-sized foreignObject
        // (unlike Chrome/WebKit), so the box needs explicit non-zero dimensions.
        // We size it generously and offset it by (-width/2, -height) so its
        // bottom-center stays at the anchor point computed by the transform,
        // then the menu anchors to the bottom-center of this box.
        <foreignObject
          width={MENU_FO_WIDTH}
          height={MENU_FO_HEIGHT}
          style={{ overflow: "visible", pointerEvents: "none" }}
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
                    Math.pow(size.width / 2, 2) + Math.pow(size.height / 2, 2),
                  );
                  const normalizedRotation = Math.abs(rotation % 90);
                  const radians = (normalizedRotation * Math.PI) / 180;

                  const baseAngle = Math.atan2(size.height, size.width);
                  const rotatedAngle = baseAngle + radians;
                  const offset =
                    diagonalHalf * Math.sin(rotatedAngle) - size.height / 2;

                  return -Math.max(0, offset);
                })()) - 15
          }) translate(${-MENU_FO_WIDTH / 2}, ${-MENU_FO_HEIGHT})`}
        >
          {menu}
        </foreignObject>
      )}
    </g>
  );
}
