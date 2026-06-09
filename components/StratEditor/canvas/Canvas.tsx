"use client";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import SVGAsset, { AssetHandle } from "./SVGAsset";
import { arrowGeomFromEndpoints, getArrowEndpoints } from "./arrow";
import { ArrowCorner } from "@/lib/types/asset.types";
import { useKeys } from "../../hooks/useKey";
import isKeyDown from "../../hooks/isKeyDown";
import { deepCopy } from "../../Objects";
import MapBackground from "./MapBackground";
import { R6Map } from "@/lib/types/strat.types";
import { Asset, PlacedAsset } from "@/lib/types/asset.types";
import { TeamMember } from "@/lib/types/team.types";
import { useUser } from "../../context/UserContext";
import { cn } from "@/lib/utils";
import { useViewport } from "./useViewport";
import { clamp, resizeAsset, rotateVector } from "./Canvas.functions";
import { DRAG_ASSET_DATA_TYPE } from "../sidebar/DraggableAssetButton";

export interface CanvasAsset {
  _id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation?: number;
}

interface CanvasProps<A extends CanvasAsset> {
  map: R6Map | null;
  assets: A[];
  onAssetAdd: (asset: Omit<Asset & Partial<PlacedAsset>, "_id">) => void;
  onAssetChange: (assets: A[]) => void;
  onAssetRemove: (assets: A["_id"][]) => void;
  renderAsset: (
    asset: A,
    selectedAssets: A[],
    selectedBy: TeamMember["_id"][],
    latestSelected: boolean,
  ) => { asset: React.ReactNode; menu: React.ReactNode | null };
  selectedAssets: { assetID: A["_id"]; userID: TeamMember["_id"] }[];
  onSelect: (selected: A["_id"][]) => void;
  onDeselect: (selected: A["_id"][]) => void;
  onAssetDoubleClick?: (asset: A) => void;
  readonly?: boolean;
  showFloorNames: boolean;
}

// should be a multiple of 4 and 3 to have nicer numbers for aspect ratio
export const CANVAS_BASE_SIZE = 2400;
const DRAG_DEADZONE = 1;
export const ASSET_BASE_SIZE = 40;

export default function StratEditorCanvas<A extends CanvasAsset>({
  map,
  assets: propAssets,
  onAssetAdd,
  onAssetChange,
  onAssetRemove,
  renderAsset,
  selectedAssets,
  onSelect,
  onDeselect,
  onAssetDoubleClick,
  readonly,
  showFloorNames,
}: Readonly<CanvasProps<A>>) {
  const { user } = useUser();

  const userSelectedAssets = useMemo(
    () =>
      selectedAssets
        .filter((s) => s.userID === user?._id)
        .map((s) => s.assetID),
    [selectedAssets, user?._id],
  );

  const [assets, setAssets] = useState<A[]>(propAssets);
  // update assets when prop changes
  useEffect(() => {
    setAssets((assets) => {
      const newAssets = propAssets.filter(
        (a) => !assets.some((b) => b._id === a._id),
      );
      // prevent update for assets that are actively being edited by the user
      const filteredAssets = assets
        .filter((a) => propAssets.some((b) => b._id === a._id))
        .map((a) => {
          const isEditing = activeAction !== "none";
          if (userSelectedAssets.includes(a._id) && isEditing) return a;
          return propAssets.find((b) => b._id === a._id) ?? a;
        });
      return [...filteredAssets, ...newAssets];
    });
  }, [propAssets]);
  const assetsRef = useRef<A[]>(propAssets);
  assetsRef.current = assets;

  const sortedAssets = useMemo(() => {
    return [
      ...assets.filter((a) => !userSelectedAssets.includes(a._id)),
      ...(userSelectedAssets
        .map((s) => assets.find((a) => a._id === s))
        .filter(Boolean) as A[]),
    ];
  }, [assets, userSelectedAssets]);

  const svgRef = useRef<SVGSVGElement>(null!);

  const [activeAction, setActiveAction] = useState<
    | "none"
    | "dragging"
    | "resizing"
    | "rotating"
    | "moving-arrow-start"
    | "moving-arrow-end"
  >("none");
  // store time from last action end to prevent deselect on click right after rotating
  const actionEndTime = useRef(0);
  const [actionStart, setActionStart] = useState({
    x: 0,
    y: 0,
    asset: null as A | null,
    startPositions: [] as {
      _id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    }[],
  });

  // viewport management with zoom and pan event listeners
  const {
    viewBox,
    zoomedViewBox,
    zoomFactor,
    canDragViewport,
    isDraggingViewport,
    handleWheel,
  } = useViewport({
    map,
    svgRef,
    baseWidth: CANVAS_BASE_SIZE,
    isViewportMovable: activeAction === "none",
  });

  // mouse down on asset
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, assetId: string, handle: AssetHandle) => {
      if (readonly) return;
      const svg = svgRef.current;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        svg.getScreenCTM()?.inverse() || new DOMMatrix(),
      );

      if (handle === "none") {
        if (e.shiftKey) {
          if (userSelectedAssets.includes(assetId)) {
            onDeselect([assetId]);
          } else {
            onSelect([assetId]);
          }
        } else {
          if (userSelectedAssets.includes(assetId)) {
            if (userSelectedAssets.length > 1) {
              onDeselect(userSelectedAssets.filter((id) => id !== assetId));
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
        asset: deepCopy(
          assetsRef.current.find((a) => a._id === assetId) || null,
        ),
        startPositions: assetsRef.current
          .filter(
            (a) => userSelectedAssets.includes(a._id) || a._id === assetId,
          )
          .map((a) => ({
            ...a.position,
            ...a.size,
            rotation: a.rotation || 0,
            _id: a._id,
          })),
      });
    },
    [userSelectedAssets, readonly],
  );

  // touch start on asset
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, assetId: string, handle: AssetHandle) => {
      if (readonly) return;
      const svg = svgRef.current;
      if (!svg) return;

      // Prevent default to stop viewport panning
      e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;

      const pt = svg.createSVGPoint();
      pt.x = touch.clientX;
      pt.y = touch.clientY;
      const svgP = pt.matrixTransform(
        svg.getScreenCTM()?.inverse() || new DOMMatrix(),
      );

      if (handle === "none") {
        // For touch, we don't have shift key, so behavior is similar to click without shift
        if (userSelectedAssets.includes(assetId)) {
          // Keep current selection when clicking on already selected asset (consistent with mouse)
          if (userSelectedAssets.length > 1) {
            // If multiple assets are selected, focus on just this one
            onDeselect(userSelectedAssets.filter((id) => id !== assetId));
          }
        } else {
          // Deselect others and select this asset
          if (userSelectedAssets.length > 0) {
            onDeselect(userSelectedAssets);
          }
          onSelect([assetId]);
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
        asset: deepCopy(
          assetsRef.current.find((a) => a._id === assetId) || null,
        ),
        startPositions: assetsRef.current
          .filter(
            (a) => userSelectedAssets.includes(a._id) || a._id === assetId,
          )
          .map((a) => ({
            ...a.position,
            ...a.size,
            rotation: a.rotation || 0,
            _id: a._id,
          })),
      });
    },
    [userSelectedAssets, readonly],
  );

  // recompute an arrow's box + start corner while a line end is being dragged
  const moveArrowEndpoint = useCallback(
    (assets: A[], svgP: { x: number; y: number }): A[] => {
      const arrow = actionStart.asset;
      if (!arrow) return assets;
      const startCorner =
        (arrow as CanvasAsset & { startCorner?: ArrowCorner }).startCorner ??
        "tl";
      const { start, end } = getArrowEndpoints(
        arrow.position,
        arrow.size,
        startCorner,
      );
      // the endpoint not being dragged stays fixed
      const fixed = activeAction === "moving-arrow-start" ? end : start;
      const moving = {
        x: clamp(svgP.x, 0, viewBox.width),
        y: clamp(svgP.y, 0, viewBox.height),
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
    [activeAction, actionStart, viewBox.width, viewBox.height],
  );

  // mouse move when dragging/resizing/rotating assets
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (userSelectedAssets.length === 0 || activeAction === "none") return;

      const svg = svgRef.current;
      if (!svg) return;
      // deliberately use assets from first render when dragging started
      const assets = assetsRef.current;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        svg.getScreenCTM()?.inverse() || new DOMMatrix(),
      );

      if (
        activeAction === "moving-arrow-start" ||
        activeAction === "moving-arrow-end"
      ) {
        setAssets((assets) => moveArrowEndpoint(assets, svgP));
      } else if (activeAction === "dragging") {
        const dx = svgP.x - actionStart.x;
        const dy = svgP.y - actionStart.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        if (distance < DRAG_DEADZONE) return;

        setAssets((assets) =>
          assets.map((asset) => {
            if (!userSelectedAssets.includes(asset._id)) return asset;
            const startPos = actionStart.startPositions.find(
              (pos) => pos._id === asset._id,
            );
            if (!startPos) return asset;

            // clamp to not go out of bounds of the canvas
            let newX = startPos.x + dx;
            let newY = startPos.y + dy;
            newX = clamp(newX, 0, viewBox.width - asset.size.width);
            newY = clamp(newY, 0, viewBox.height - asset.size.height);

            return {
              ...asset,
              position: {
                x: newX,
                y: newY,
              },
            };
          }),
        );
      } else if (activeAction === "resizing" || activeAction === "rotating") {
        const selected = assets.filter((a) =>
          userSelectedAssets.includes(a._id),
        );
        if (selected.length === 0) return;

        if (activeAction === "rotating" || e.ctrlKey) {
          // rotating asset
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
              const startPos = actionStart.startPositions.find(
                (pos) => pos._id === a._id,
              );
              if (!startPos) return a;
              const angle = Math.atan2(deltaY, deltaX);
              let rotation =
                (startPos.rotation +
                  angle * (180 / Math.PI) +
                  720 -
                  baseAngle) %
                360;
              // snap to 45° increments if shift is held
              if (e.shiftKey) {
                rotation = Math.round(rotation / 45) * 45;
              }
              return {
                ...a,
                rotation,
              };
            }),
          );
        } else {
          // Calculate delta in screen coordinates
          const rawX = svgP.x - actionStart.x;
          const rawY = svgP.y - actionStart.y;
          const delta = rotateVector(
            { x: rawX, y: rawY },
            -(actionStart.asset?.rotation || 0),
          );

          // resizing asset
          const makeSquare = e.shiftKey;

          setAssets((assets) =>
            assets.map((a) => {
              if (!userSelectedAssets.includes(a._id)) return a;
              const startPos = actionStart.startPositions.find(
                (pos) => pos._id === a._id,
              );
              if (!startPos) return a;
              const newProperties = resizeAsset(
                {
                  position: startPos,
                  size: startPos,
                  rotation: startPos.rotation,
                },
                delta,
                makeSquare,
              );
              return {
                ...a,
                ...newProperties,
              };
            }),
          );
        }
      }
    },
    [activeAction, userSelectedAssets, actionStart, moveArrowEndpoint],
  );

  // mouse up when dragging/resizing/rotating assets
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (activeAction !== "none") {
        onAssetChange(
          userSelectedAssets
            .map((id) => assetsRef.current.find((a) => a._id === id)!)
            .filter(Boolean),
        );
        actionEndTime.current = Date.now();
      }
      setActiveAction("none");
    },
    [activeAction, userSelectedAssets],
  );

  // touch move when dragging/resizing/rotating assets
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (userSelectedAssets.length === 0 || activeAction === "none") return;

      const svg = svgRef.current;
      if (!svg) return;

      // Prevent default for better browser compatibility (CSS touch-action is also set on SVG)
      e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;

      // deliberately use assets from first render when dragging started
      const assets = assetsRef.current;

      const pt = svg.createSVGPoint();
      pt.x = touch.clientX;
      pt.y = touch.clientY;
      const svgP = pt.matrixTransform(
        svg.getScreenCTM()?.inverse() || new DOMMatrix(),
      );

      if (
        activeAction === "moving-arrow-start" ||
        activeAction === "moving-arrow-end"
      ) {
        setAssets((assets) => moveArrowEndpoint(assets, svgP));
      } else if (activeAction === "dragging") {
        const dx = svgP.x - actionStart.x;
        const dy = svgP.y - actionStart.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        if (distance < DRAG_DEADZONE) return;

        setAssets((assets) =>
          assets.map((asset) => {
            if (!userSelectedAssets.includes(asset._id)) return asset;
            const startPos = actionStart.startPositions.find(
              (pos) => pos._id === asset._id,
            );
            if (!startPos) return asset;

            // clamp to not go out of bounds of the canvas
            let newX = startPos.x + dx;
            let newY = startPos.y + dy;
            newX = clamp(newX, 0, viewBox.width - asset.size.width);
            newY = clamp(newY, 0, viewBox.height - asset.size.height);

            return {
              ...asset,
              position: {
                x: newX,
                y: newY,
              },
            };
          }),
        );
      } else if (activeAction === "resizing" || activeAction === "rotating") {
        const selected = assets.filter((a) =>
          userSelectedAssets.includes(a._id),
        );
        if (selected.length === 0) return;

        if (activeAction === "rotating") {
          // rotating asset
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
              const startPos = actionStart.startPositions.find(
                (pos) => pos._id === a._id,
              );
              if (!startPos) return a;
              const angle = Math.atan2(deltaY, deltaX);
              let rotation =
                (startPos.rotation +
                  angle * (180 / Math.PI) +
                  720 -
                  baseAngle) %
                360;
              return {
                ...a,
                rotation,
              };
            }),
          );
        } else {
          // Calculate delta in screen coordinates
          const rawX = svgP.x - actionStart.x;
          const rawY = svgP.y - actionStart.y;
          const delta = rotateVector(
            { x: rawX, y: rawY },
            -(actionStart.asset?.rotation || 0),
          );

          // resizing asset
          const makeSquare = false; // no shift key on touch

          setAssets((assets) =>
            assets.map((a) => {
              if (!userSelectedAssets.includes(a._id)) return a;
              const startPos = actionStart.startPositions.find(
                (pos) => pos._id === a._id,
              );
              if (!startPos) return a;
              const newProperties = resizeAsset(
                {
                  position: startPos,
                  size: startPos,
                  rotation: startPos.rotation,
                },
                delta,
                makeSquare,
              );
              return {
                ...a,
                ...newProperties,
              };
            }),
          );
        }
      }
    },
    [activeAction, userSelectedAssets, actionStart, moveArrowEndpoint],
  );

  // touch end when dragging/resizing/rotating assets
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (activeAction !== "none") {
        onAssetChange(
          userSelectedAssets
            .map((id) => assetsRef.current.find((a) => a._id === id)!)
            .filter(Boolean),
        );
        actionEndTime.current = Date.now();
      }
      setActiveAction("none");
    },
    [activeAction, userSelectedAssets],
  );

  // global mousemove and mouseup listeners when dragging/resizing/rotating
  useEffect(() => {
    if (activeAction !== "none") {
      window.addEventListener("mousemove", handleMouseMove, { passive: false });
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    activeAction,
    handleMouseUp,
    handleMouseMove,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // add non-passive handleWheel event listener to svg
  useEffect(() => {
    if (!svgRef.current) return;
    svgRef.current.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      svgRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // keyboard shortcuts
  useKeys([
    // remove selected assets
    {
      shortcut: ["Backspace", "Delete"],
      action() {
        if (document.activeElement !== svgRef.current) return;
        onAssetRemove(userSelectedAssets);
      },
      active: !readonly,
    },
    // deselect all
    {
      shortcut: ["Escape"],
      action() {
        if (document.activeElement !== svgRef.current) return;
        onDeselect(userSelectedAssets);
      },
      active: !readonly,
    },
    // select all
    {
      shortcut: {
        key: "a",
        ctrlKey: true,
      },
      action(e) {
        if (document.activeElement !== svgRef.current) return;
        onSelect(
          assets
            .map((a) => a._id)
            .filter((id) => !userSelectedAssets.includes(id)),
        );
        e.preventDefault();
      },
      active: !readonly,
    },
  ]);

  const ctrlKeyDown = isKeyDown("Control");

  return (
    <div className="relative overflow-hidden w-full h-full">
      <svg
        id="strat-editor-svg"
        ref={svgRef}
        viewBox={`${zoomedViewBox.x} ${zoomedViewBox.y} ${zoomedViewBox.width} ${zoomedViewBox.height}`}
        className={cn(
          "w-full h-full",
          canDragViewport &&
            (isDraggingViewport ? "cursor-grabbing" : "cursor-grab"),
        )}
        style={{
          touchAction: activeAction !== "none" ? "none" : "auto",
        }}
        preserveAspectRatio="xMidYMid meet"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(e) => {
          e.preventDefault();
          const data = e.dataTransfer.getData(DRAG_ASSET_DATA_TYPE);
          if (!data) return;

          const asset = JSON.parse(data);
          const svg = svgRef.current;
          if (!svg) return;

          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgP = pt.matrixTransform(
            svg.getScreenCTM()?.inverse() || new DOMMatrix(),
          );

          const width = asset.size?.width || ASSET_BASE_SIZE;
          const height = asset.size?.height || ASSET_BASE_SIZE;

          onAssetAdd({
            ...asset,
            position: {
              x: clamp(svgP.x - width / 2, 0, viewBox.width - width),
              y: clamp(svgP.y - height / 2, 0, viewBox.height - height),
            },
          });

          // Focus the SVG so keyboard shortcuts (delete, etc.) work immediately
          svg.focus();
        }}
        onClick={(e) => {
          e.stopPropagation();
          // prevent deselecting assets after rotating
          // drag of rotate can be recognized as click if you leave the click area of the asset while rotating
          if (Date.now() - actionEndTime.current < 500) return;
          onDeselect(userSelectedAssets);
        }}
        tabIndex={readonly ? undefined : 0}
        focusable
      >
        {/* Global filter definitions */}
        <defs>
          <filter
            id="globalDropShadow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="1"
              floodOpacity="0.9"
              floodColor="#000000"
            />
          </filter>
        </defs>

        <MapBackground
          assets={assets}
          map={map}
          viewBox={viewBox}
          addAsset={onAssetAdd}
          readonly={readonly}
          showFloorNames={showFloorNames}
        />

        {/* Render assets */}
        {sortedAssets.map((asset) => {
          const render = renderAsset(
            asset,
            userSelectedAssets
              .map((id) => assets.find((asset) => id === asset._id)!)
              .filter(Boolean),
            selectedAssets
              .filter((s) => s.assetID === asset._id)
              .map((s) => s.userID),
            userSelectedAssets.at(-1) === asset._id,
          );
          return (
            <SVGAsset
              key={asset._id}
              position={asset.position}
              size={asset.size}
              rotation={asset.rotation || 0}
              onMouseDown={(e, handle) => handleMouseDown(e, asset._id, handle)}
              onTouchStart={(e, handle) =>
                handleTouchStart(e, asset._id, handle)
              }
              onDoubleClick={() => onAssetDoubleClick?.(asset)}
              selected={userSelectedAssets.includes(asset._id)}
              ctrlKeyDown={ctrlKeyDown}
              menu={render.menu}
              zoom={zoomFactor}
              readonly={readonly}
              nativeSvg={asset.type === "operator"}
              arrowStartCorner={
                asset.type === "arrow"
                  ? ((asset as CanvasAsset & { startCorner?: ArrowCorner })
                      .startCorner ?? "tl")
                  : undefined
              }
            >
              {render.asset}
            </SVGAsset>
          );
        })}
      </svg>
    </div>
  );
}
