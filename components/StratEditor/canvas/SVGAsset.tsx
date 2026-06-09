"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowCorner } from "@/lib/types/asset.types";
import { getArrowEndpoints } from "./arrow";

export type AssetHandle =
  | "resize"
  | "rotate"
  | "none"
  | "arrow-start"
  | "arrow-end";

// The menu's foreignObject must be large enough to contain the (2x scaled) menu
// in every browser. Firefox clips to these bounds, so they are intentionally
// generous; the box is non-interactive (pointerEvents: none) and only its
// content (the menu) receives pointer events.
//
// The MultiOptionSelector dropdown aligns the selected option with the menu bar,
// so it expands BOTH upward and downward (at scale-200, with up to ~11 options
// it reaches several hundred px in each direction). The box therefore reserves
// MENU_FO_ABOVE above and MENU_FO_BELOW below the menu bar; the menu sits at the
// bottom of a wrapper of height MENU_FO_ABOVE, so it lands exactly on the anchor
// point while leaving room for the dropdown to overflow in either direction.
const MENU_FO_WIDTH = 4000;
const MENU_FO_ABOVE = 1000;
const MENU_FO_BELOW = 1000;
const MENU_FO_HEIGHT = MENU_FO_ABOVE + MENU_FO_BELOW;

interface SVGAssetProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  onMouseDown: (e: React.MouseEvent, handle: AssetHandle) => void;
  onTouchStart: (e: React.TouchEvent, handle: AssetHandle) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  selected: boolean;
  children: React.ReactNode;
  ctrlKeyDown?: boolean;
  menu?: React.ReactNode;
  zoom: number;
  readonly?: boolean;
  /**
   * When true, the children are rendered as native SVG directly (not wrapped in
   * a foreignObject), while keeping the normal resize/rotate handles. Used for
   * assets that draw themselves as SVG (e.g. operators) to avoid Safari's
   * foreignObject rendering bugs. Ignored for arrows, which already render
   * natively via `arrowStartCorner`.
   */
  nativeSvg?: boolean;
  /**
   * When set, the asset is an arrow: its children are rendered as native SVG
   * (not in a foreignObject) and the start/end corners get draggable line-end
   * handles instead of the resize/rotate handles.
   */
  arrowStartCorner?: ArrowCorner;
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
  nativeSvg,
  arrowStartCorner,
}: Readonly<SVGAssetProps>) {
  const assetRef = useRef<SVGGElement>(null);
  const isArrow = arrowStartCorner !== undefined;

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
        {isArrow ? (
          <>
            {/* Native SVG arrow (no foreignObject -> no clipping) */}
            {children}
            {(() => {
              if (readonly || !selected) return null;
              const { start, end } = getArrowEndpoints(
                { x: 0, y: 0 },
                size,
                arrowStartCorner ?? "tl",
              );
              return (
                <>
                  {(
                    [
                      ["arrow-start", start],
                      ["arrow-end", end],
                    ] as const
                  ).map(([handle, point]) => (
                    <circle
                      key={handle}
                      cx={point.x}
                      cy={point.y}
                      r=".7%"
                      fill="white"
                      filter="url(#globalDropShadow)"
                      className={cn(!readonly && "cursor-move")}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onMouseDown(e, handle);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        onTouchStart(e, handle);
                      }}
                    />
                  ))}
                </>
              );
            })()}
          </>
        ) : (
          <>
            {nativeSvg ? (
              children
            ) : (
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
            )}
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
          </>
        )}
      </g>
      {menu && (
        // Firefox does not paint content that overflows a 0-sized foreignObject
        // (unlike Chrome/WebKit), so the box needs explicit non-zero dimensions.
        // We size it generously and offset it by (-width/2, -MENU_FO_ABOVE) so
        // the menu bar (bottom-anchored within a wrapper of height
        // MENU_FO_ABOVE) lands on the anchor point computed by the transform,
        // leaving MENU_FO_BELOW of paintable room beneath it for the dropdown.
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
          }) translate(${-MENU_FO_WIDTH / 2}, ${-MENU_FO_ABOVE})`}
        >
          {/* Wrapper height = MENU_FO_ABOVE so the menu's `bottom-0` anchors on
              the computed point; the dropdown can overflow above (into this
              wrapper) and below (into the MENU_FO_BELOW region) without Firefox
              clipping it. */}
          <div
            style={{
              position: "relative",
              width: MENU_FO_WIDTH,
              height: MENU_FO_ABOVE,
              pointerEvents: "none",
            }}
          >
            {menu}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
