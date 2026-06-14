import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCorner } from "@/lib/types/asset.types";
import { CanvasAsset } from "./Canvas";
import { AssetHandle } from "./SVGAsset";
import { arrowGeomFromEndpoints, getArrowEndpoints } from "./arrow";
import { clamp, clientToSvgPoint, resizeAsset, rotateVector } from "./Canvas.functions";
import { deepCopy } from "../../Objects";

export type AssetAction =
  | "none"
  | "dragging"
  | "resizing"
  | "rotating"
  | "moving-arrow-start"
  | "moving-arrow-end";

// minimum movement (in svg units) before a drag actually moves the asset
const DRAG_DEADZONE = 1;

interface StartPosition {
  _id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface ActionStart<A> {
  x: number;
  y: number;
  asset: A | null;
  startPositions: StartPosition[];
}

interface UseAssetInteractionOptions<A extends CanvasAsset> {
  svgRef: React.RefObject<SVGSVGElement>;
  assetsRef: React.MutableRefObject<A[]>;
  setAssets: React.Dispatch<React.SetStateAction<A[]>>;
  /** asset ids currently selected by the local user */
  userSelectedAssets: string[];
  /** live viewBox dimensions, read at interaction time for clamping */
  viewBoxRef: React.MutableRefObject<{ width: number; height: number }>;
  onAssetChange: (assets: A[]) => void;
  onSelect: (ids: string[]) => void;
  onDeselect: (ids: string[]) => void;
  readonly?: boolean;
}

/**
 * Encapsulates the direct-manipulation interactions on a single asset (and the
 * rest of the current selection): dragging, resizing, rotating and moving arrow
 * endpoints. Mouse and touch share the same core; the only difference is that
 * touch has no shift/ctrl modifiers (so no rotate-via-ctrl, snap or aspect lock).
 */
export function useAssetInteraction<A extends CanvasAsset>({
  svgRef,
  assetsRef,
  setAssets,
  userSelectedAssets,
  viewBoxRef,
  onAssetChange,
  onSelect,
  onDeselect,
  readonly,
}: UseAssetInteractionOptions<A>) {
  const [activeAction, setActiveAction] = useState<AssetAction>("none");
  // time the last action ended, used to suppress the deselect click after a drag
  const actionEndTime = useRef(0);
  // when clicking (without shift) an already-selected asset inside a
  // multi-selection, we keep the whole selection so it can be dragged as a group
  // and only narrow to this single asset if the pointer is released without a
  // drag. Holds that asset id between mousedown and mouseup; null otherwise.
  const pendingNarrowRef = useRef<string | null>(null);
  // whether the current drag actually moved (past the deadzone)
  const didMoveRef = useRef(false);
  const [actionStart, setActionStart] = useState<ActionStart<A>>({
    x: 0,
    y: 0,
    asset: null,
    startPositions: [],
  });

  // start an interaction from an svg-space point + modifier state
  const begin = useCallback(
    (svgP: { x: number; y: number }, assetId: string, handle: AssetHandle, shiftKey: boolean) => {
      pendingNarrowRef.current = null;
      didMoveRef.current = false;

      if (handle === "none") {
        if (shiftKey) {
          if (userSelectedAssets.includes(assetId)) {
            onDeselect([assetId]);
          } else {
            onSelect([assetId]);
          }
        } else {
          if (userSelectedAssets.includes(assetId)) {
            // already selected: keep the whole selection so a group drag moves
            // everything; narrow to just this asset only if it's a click (no
            // drag), handled in endAction.
            if (userSelectedAssets.length > 1) {
              pendingNarrowRef.current = assetId;
            }
          } else {
            if (userSelectedAssets.length > 0) {
              onDeselect(userSelectedAssets);
            }
            onSelect([assetId]);
          }
        }
      }

      if (handle === "resize") {
        setActiveAction("resizing");
      } else if (handle === "rotate") {
        setActiveAction("rotating");
      } else if (handle === "arrow-start") {
        setActiveAction("moving-arrow-start");
      } else if (handle === "arrow-end") {
        setActiveAction("moving-arrow-end");
      } else {
        setActiveAction("dragging");
      }

      setActionStart({
        x: svgP.x,
        y: svgP.y,
        asset: deepCopy(assetsRef.current.find((a) => a._id === assetId) || null),
        startPositions: assetsRef.current
          .filter((a) => userSelectedAssets.includes(a._id) || a._id === assetId)
          .map((a) => ({
            ...a.position,
            ...a.size,
            rotation: a.rotation || 0,
            _id: a._id,
          })),
      });
    },
    [userSelectedAssets, onSelect, onDeselect, assetsRef],
  );

  const onAssetMouseDown = useCallback(
    (e: React.MouseEvent, assetId: string, handle: AssetHandle) => {
      if (readonly) return;
      const svg = svgRef.current;
      if (!svg) return;
      begin(clientToSvgPoint(svg, e.clientX, e.clientY), assetId, handle, e.shiftKey);
    },
    [begin, readonly, svgRef],
  );

  const onAssetTouchStart = useCallback(
    (e: React.TouchEvent, assetId: string, handle: AssetHandle) => {
      if (readonly) return;
      // Prevent default to stop viewport panning
      e.preventDefault();
      const svg = svgRef.current;
      const touch = e.touches[0];
      if (!svg || !touch) return;
      begin(clientToSvgPoint(svg, touch.clientX, touch.clientY), assetId, handle, false);
    },
    [begin, readonly, svgRef],
  );

  // recompute an arrow's box + start corner while a line end is being dragged
  const moveArrowEndpoint = useCallback(
    (assets: A[], svgP: { x: number; y: number }): A[] => {
      const arrow = actionStart.asset;
      if (!arrow) return assets;
      const startCorner =
        (arrow as CanvasAsset & { startCorner?: ArrowCorner }).startCorner ?? "tl";
      const { start, end } = getArrowEndpoints(arrow.position, arrow.size, startCorner);
      // the endpoint not being dragged stays fixed
      const fixed = activeAction === "moving-arrow-start" ? end : start;
      const moving = {
        x: clamp(svgP.x, 0, viewBoxRef.current.width),
        y: clamp(svgP.y, 0, viewBoxRef.current.height),
      };
      const geom = arrowGeomFromEndpoints(
        activeAction === "moving-arrow-start" ? moving : fixed,
        activeAction === "moving-arrow-start" ? fixed : moving,
      );
      return assets.map((a) =>
        a._id === arrow._id
          ? ({
              ...a,
              position: geom.position,
              size: geom.size,
              startCorner: geom.startCorner,
            } as A)
          : a,
      );
    },
    [activeAction, actionStart, viewBoxRef],
  );

  // apply a pointer move to the selection, given an svg-space point + modifiers
  const applyMove = useCallback(
    (svgP: { x: number; y: number }, shiftKey: boolean, ctrlKey: boolean) => {
      if (userSelectedAssets.length === 0 || activeAction === "none") return;
      const viewBox = viewBoxRef.current;

      if (activeAction === "moving-arrow-start" || activeAction === "moving-arrow-end") {
        setAssets((assets) => moveArrowEndpoint(assets, svgP));
        return;
      }

      if (activeAction === "dragging") {
        const dx = svgP.x - actionStart.x;
        const dy = svgP.y - actionStart.y;
        if (Math.sqrt(dx ** 2 + dy ** 2) < DRAG_DEADZONE) return;
        didMoveRef.current = true;

        setAssets((assets) =>
          assets.map((asset) => {
            if (!userSelectedAssets.includes(asset._id)) return asset;
            const startPos = actionStart.startPositions.find((pos) => pos._id === asset._id);
            if (!startPos) return asset;

            // clamp to not go out of bounds of the canvas
            const newX = clamp(startPos.x + dx, 0, viewBox.width - asset.size.width);
            const newY = clamp(startPos.y + dy, 0, viewBox.height - asset.size.height);

            return { ...asset, position: { x: newX, y: newY } };
          }),
        );
        return;
      }

      // resizing / rotating
      if (activeAction === "rotating" || ctrlKey) {
        const startX = actionStart.asset
          ? actionStart.asset.position.x + actionStart.asset.size.width / 2
          : actionStart.x;
        const startY = actionStart.asset
          ? actionStart.asset.position.y + actionStart.asset.size.height / 2
          : actionStart.y;

        const deltaX = svgP.x - startX;
        const deltaY = svgP.y - startY;

        // 45° is to eliminate the offset from starting the drag at the bottom right corner
        const baseAngle = 45 + (actionStart.asset?.rotation || 0);

        setAssets((assets) =>
          assets.map((a) => {
            if (!userSelectedAssets.includes(a._id)) return a;
            const startPos = actionStart.startPositions.find((pos) => pos._id === a._id);
            if (!startPos) return a;
            const angle = Math.atan2(deltaY, deltaX);
            let rotation = (startPos.rotation + angle * (180 / Math.PI) + 720 - baseAngle) % 360;
            // snap to 45° increments if shift is held
            if (shiftKey) rotation = Math.round(rotation / 45) * 45;
            return { ...a, rotation };
          }),
        );
        return;
      }

      // resizing: compute delta in the asset's local (unrotated) space
      const rawX = svgP.x - actionStart.x;
      const rawY = svgP.y - actionStart.y;
      const delta = rotateVector({ x: rawX, y: rawY }, -(actionStart.asset?.rotation || 0));
      const makeSquare = shiftKey;

      setAssets((assets) =>
        assets.map((a) => {
          if (!userSelectedAssets.includes(a._id)) return a;
          const startPos = actionStart.startPositions.find((pos) => pos._id === a._id);
          if (!startPos) return a;
          const newProperties = resizeAsset(
            { position: startPos, size: startPos, rotation: startPos.rotation },
            delta,
            makeSquare,
          );
          return { ...a, ...newProperties };
        }),
      );
    },
    [activeAction, userSelectedAssets, actionStart, moveArrowEndpoint, setAssets, viewBoxRef],
  );

  const endAction = useCallback(() => {
    if (activeAction !== "none") {
      onAssetChange(
        userSelectedAssets
          .map((id) => assetsRef.current.find((a) => a._id === id)!)
          .filter(Boolean),
      );
      // a click (no drag) on an asset within a multi-selection narrows the
      // selection down to just that asset
      if (pendingNarrowRef.current && !didMoveRef.current) {
        const keep = pendingNarrowRef.current;
        onDeselect(userSelectedAssets.filter((id) => id !== keep));
      }
      actionEndTime.current = Date.now();
    }
    pendingNarrowRef.current = null;
    setActiveAction("none");
  }, [activeAction, userSelectedAssets, onAssetChange, onDeselect, assetsRef]);

  // global move/up listeners while an interaction is in progress (mouse + touch)
  useEffect(() => {
    if (activeAction === "none") return;

    const onMouseMove = (e: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      applyMove(clientToSvgPoint(svg, e.clientX, e.clientY), e.shiftKey, e.ctrlKey);
    };
    const onTouchMove = (e: TouchEvent) => {
      const svg = svgRef.current;
      const touch = e.touches[0];
      if (!svg || !touch) return;
      // Prevent default for better browser compatibility (CSS touch-action is also set on SVG)
      e.preventDefault();
      applyMove(clientToSvgPoint(svg, touch.clientX, touch.clientY), false, false);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: false });
    window.addEventListener("mouseup", endAction);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", endAction);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endAction);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", endAction);
    };
  }, [activeAction, applyMove, endAction, svgRef]);

  return { activeAction, actionEndTime, onAssetMouseDown, onAssetTouchStart };
}
