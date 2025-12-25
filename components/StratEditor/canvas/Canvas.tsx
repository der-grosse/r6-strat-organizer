"use client";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import SVGAsset from "./SVGAsset";
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
    latestSelected: boolean
  ) => { asset: React.ReactNode; menu: React.ReactNode | null };
  selectedAssets: { assetID: A["_id"]; userID: TeamMember["_id"] }[];
  onSelect: (selected: A["_id"][]) => void;
  onDeselect: (selected: A["_id"][]) => void;
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
  readonly,
  showFloorNames,
}: Readonly<CanvasProps<A>>) {
  const { user } = useUser();

  const userSelectedAssets = useMemo(
    () =>
      selectedAssets
        .filter((s) => s.userID === user?._id)
        .map((s) => s.assetID),
    [selectedAssets, user?._id]
  );

  const [assets, setAssets] = useState<A[]>(propAssets);
  // update assets when prop changes
  useEffect(() => {
    setAssets((assets) => {
      const newAssets = propAssets.filter(
        (a) => !assets.some((b) => b._id === a._id)
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
    "none" | "dragging" | "resizing" | "rotating"
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
    isViewportMovable: !readonly && activeAction === "none",
  });

  // mouse down on asset
  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      assetId: string,
      handle: "resize" | "rotate" | "none"
    ) => {
      if (readonly) return;
      const svg = svgRef.current;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        svg.getScreenCTM()?.inverse() || new DOMMatrix()
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
      } else {
        setActiveAction("dragging");
      }
      setActionStart({
        x: svgP.x,
        y: svgP.y,
        asset: deepCopy(
          assetsRef.current.find((a) => a._id === assetId) || null
        ),
        startPositions: assetsRef.current
          .filter(
            (a) => userSelectedAssets.includes(a._id) || a._id === assetId
          )
          .map((a) => ({
            ...a.position,
            ...a.size,
            rotation: a.rotation || 0,
            _id: a._id,
          })),
      });
    },
    [userSelectedAssets, readonly]
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
        svg.getScreenCTM()?.inverse() || new DOMMatrix()
      );

      if (activeAction === "dragging") {
        const dx = svgP.x - actionStart.x;
        const dy = svgP.y - actionStart.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        if (distance < DRAG_DEADZONE) return;

        setAssets((assets) =>
          assets.map((asset) => {
            if (!userSelectedAssets.includes(asset._id)) return asset;
            const startPos = actionStart.startPositions.find(
              (pos) => pos._id === asset._id
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
          })
        );
      } else if (activeAction === "resizing" || activeAction === "rotating") {
        const selected = assets.filter((a) =>
          userSelectedAssets.includes(a._id)
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
                (pos) => pos._id === a._id
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
            })
          );
        } else {
          // Calculate delta in screen coordinates
          const rawX = svgP.x - actionStart.x;
          const rawY = svgP.y - actionStart.y;
          const delta = rotateVector(
            { x: rawX, y: rawY },
            -(actionStart.asset?.rotation || 0)
          );

          // resizing asset
          const makeSquare = e.shiftKey;

          setAssets((assets) =>
            assets.map((a) => {
              if (!userSelectedAssets.includes(a._id)) return a;
              const startPos = actionStart.startPositions.find(
                (pos) => pos._id === a._id
              );
              if (!startPos) return a;
              const newProperties = resizeAsset(
                {
                  position: startPos,
                  size: startPos,
                  rotation: startPos.rotation,
                },
                delta,
                makeSquare
              );
              return {
                ...a,
                ...newProperties,
              };
            })
          );
        }
      }
    },
    [activeAction, userSelectedAssets, actionStart]
  );

  // mouse up when dragging/resizing/rotating assets
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (activeAction !== "none") {
        onAssetChange(
          userSelectedAssets
            .map((id) => assetsRef.current.find((a) => a._id === id)!)
            .filter(Boolean)
        );
        actionEndTime.current = Date.now();
      }
      setActiveAction("none");
    },
    [activeAction, userSelectedAssets]
  );

  // global mousemove and mouseup listeners when dragging/resizing/rotating
  useEffect(() => {
    if (activeAction !== "none") {
      window.addEventListener("mousemove", handleMouseMove, { passive: false });
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeAction, handleMouseUp, handleMouseMove]);

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
            .filter((id) => !userSelectedAssets.includes(id))
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
        ref={svgRef}
        viewBox={`${zoomedViewBox.x} ${zoomedViewBox.y} ${zoomedViewBox.width} ${zoomedViewBox.height}`}
        className={cn(
          "w-full h-full",
          canDragViewport &&
            (isDraggingViewport ? "cursor-grabbing" : "cursor-grab")
        )}
        preserveAspectRatio="xMidYMid meet"
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
            userSelectedAssets.at(-1) === asset._id
          );
          return (
            <SVGAsset
              key={asset._id}
              position={asset.position}
              size={asset.size}
              rotation={asset.rotation || 0}
              onMouseDown={(e, handle) => handleMouseDown(e, asset._id, handle)}
              selected={userSelectedAssets.includes(asset._id)}
              ctrlKeyDown={ctrlKeyDown}
              menu={render.menu}
              zoom={zoomFactor}
              readonly={readonly}
            >
              {render.asset}
            </SVGAsset>
          );
        })}
      </svg>
    </div>
  );
}
