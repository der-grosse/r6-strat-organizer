import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasAsset } from "./Canvas";
import { clientToSvgPoint } from "./Canvas.functions";

export interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// minimum drag size (in svg units) before the marquee counts as a selection
// drag rather than a plain click (which falls through to deselect-all).
const MARQUEE_DEADZONE = 4;

interface UseMarqueeSelectionOptions<A extends CanvasAsset> {
  svgRef: React.RefObject<SVGSVGElement>;
  assetsRef: React.MutableRefObject<A[]>;
  /** asset ids currently selected by the local user (selection at drag start) */
  userSelectedAssets: string[];
  onSelect: (ids: string[]) => void;
  onDeselect: (ids: string[]) => void;
  /** when true (readonly / viewport panning) the marquee does not start */
  disabled: boolean;
}

/** Axis-aligned overlap test between the marquee and an asset's bounding box. */
function rectIntersectsAsset(rect: MarqueeRect, asset: CanvasAsset): boolean {
  return !(
    asset.position.x > rect.x + rect.width ||
    asset.position.x + asset.size.width < rect.x ||
    asset.position.y > rect.y + rect.height ||
    asset.position.y + asset.size.height < rect.y
  );
}

/**
 * Rubber-band selection: drag over an empty area of the canvas to select every
 * asset the rectangle touches. Holding shift adds to the existing selection
 * instead of replacing it. Mouse-only (touch is reserved for pan / direct
 * manipulation).
 */
export function useMarqueeSelection<A extends CanvasAsset>({
  svgRef,
  assetsRef,
  userSelectedAssets,
  onSelect,
  onDeselect,
  disabled,
}: UseMarqueeSelectionOptions<A>) {
  const [marqueeRect, setMarqueeRect] = useState<MarqueeRect | null>(null);
  // time the last marquee drag ended, used to suppress the deselect click
  const marqueeEndTime = useRef(0);
  // tears down listeners if the component unmounts mid-drag
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  const startMarquee = useCallback(
    (e: React.MouseEvent) => {
      // only left-button drags on empty canvas start a marquee
      if (disabled || e.button !== 0) return;
      const svg = svgRef.current;
      if (!svg) return;

      const start = clientToSvgPoint(svg, e.clientX, e.clientY);
      const additive = e.shiftKey;
      const base = userSelectedAssets;
      let active = false;
      let rect: MarqueeRect = { x: start.x, y: start.y, width: 0, height: 0 };
      setMarqueeRect(rect);

      const onMove = (ev: MouseEvent) => {
        const p = clientToSvgPoint(svg, ev.clientX, ev.clientY);
        rect = {
          x: Math.min(start.x, p.x),
          y: Math.min(start.y, p.y),
          width: Math.abs(p.x - start.x),
          height: Math.abs(p.y - start.y),
        };
        if (!active && (rect.width > MARQUEE_DEADZONE || rect.height > MARQUEE_DEADZONE)) {
          active = true;
        }
        setMarqueeRect(rect);
      };

      const cleanup = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        cleanupRef.current = null;
      };

      const onUp = () => {
        cleanup();
        setMarqueeRect(null);
        // a click without a real drag falls through to the canvas deselect handler
        if (!active) return;
        marqueeEndTime.current = Date.now();

        const inRect = assetsRef.current
          .filter((a) => rectIntersectsAsset(rect, a))
          .map((a) => a._id);

        if (additive) {
          const toSelect = inRect.filter((id) => !base.includes(id));
          if (toSelect.length) {
            onSelect(toSelect);
          } else if (inRect.length) {
            // every asset in the marquee is already selected -> toggle them off
            onDeselect(inRect);
          }
        } else {
          const toDeselect = base.filter((id) => !inRect.includes(id));
          const toSelect = inRect.filter((id) => !base.includes(id));
          if (toDeselect.length) onDeselect(toDeselect);
          if (toSelect.length) onSelect(toSelect);
        }
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      cleanupRef.current = cleanup;
    },
    [disabled, svgRef, assetsRef, userSelectedAssets, onSelect, onDeselect],
  );

  return { marqueeRect, marqueeEndTime, startMarquee };
}
