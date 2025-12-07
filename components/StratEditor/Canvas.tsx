"use client";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import SVGAsset from "./SVGAsset";
import { useKeys } from "../hooks/useKey";
import isKeyDown from "../hooks/isKeyDown";
import { deepCopy } from "../Objects";
import MapBackground from "./MapBackground";
import { Selection } from "./StratEditor";
import { R6Map } from "@/lib/types/strat.types";
import { Asset, PlacedAsset } from "@/lib/types/asset.types";
import { TeamMember } from "@/lib/types/team.types";

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
    selectedBy: TeamMember["_id"][],
    lastestSelected: boolean
  ) => { asset: React.ReactNode; menu: React.ReactNode | null };
  selectedAssets: Selection[];
  onSelect: (selected: string[]) => void;
  onDeselect: (selected: string[]) => void;
  readonly?: boolean;
}

// should be a multiple of 4 and 3 to have nicer numbers for aspect ratio
export const CANVAS_BASE_SIZE = 2400;
const MIN_ZOOM_FACTOR = 0.15;
let MIN_ASSET_SIZE = 16;
let MAX_ASSET_SIZE = 400;
const DRAG_DEADZONE = 1;
const ZOOM_MODIFIER = 0.004;
const SCROLL_MODIFIER = 0.5;
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
}: Readonly<CanvasProps<A>>) {
  if (typeof window !== "undefined") {
    //@ts-ignore
    window.disableAssetSizeRestriction = () => {
      MAX_ASSET_SIZE = Infinity;
      MIN_ASSET_SIZE = 4;
    };
  }

  // const socket = useSocket();

  const userSelectedAssets = useMemo(
    () => selectedAssets.map((s) => s._id),
    [selectedAssets]
  );
  // const userSelectedAssets = useMemo(
  //   () =>
  //     selectedAssets.filter((s) => s.socketID === socket._id).map((s) => s._id),
  //   [selectedAssets, socket]
  // );

  const [assets, setAssets] = useState<A[]>(propAssets);
  // update assets when prop changes
  useEffect(() => {
    setAssets((assets) => {
      const newAssets = propAssets.filter(
        (a) => !assets.some((b) => b._id === a._id)
      );
      const filteredAssets = assets
        .filter((a) => propAssets.some((b) => b._id === a._id))
        .map((a) => {
          const isEditing = isDragging || isResizing || isRotating;
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

  const svgRef = useRef<SVGSVGElement>(null);

  const [viewBox, setViewBox] = useState({
    width: CANVAS_BASE_SIZE,
    height: (CANVAS_BASE_SIZE / 4) * 3,
  });
  // Calculate viewBox based on map dimensions
  useEffect(() => {
    if (!map) return;
    const aspectRatio =
      map.floors.length === 1 || map.floors.length > 2 ? 4 / 3 : 8 / 3;
    const width = CANVAS_BASE_SIZE;
    const height = width / aspectRatio;
    setViewBox({ width, height });
  }, [map]);

  const [zoomFactor, setZoomFactor] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({
    // absolut cursor pos in svg coords
    x: 600,
    y: 450,
    // relative cursor pos in svg -> needed to keep zooming on same point when mouse is not centered
    relX: 0.5,
    relY: 0.5,
  });
  const zoomedViewBox = useMemo(() => {
    const size = {
      width: viewBox.width * zoomFactor,
      height: viewBox.height * zoomFactor,
    };
    const absolutZoomPos = {
      x: zoomOrigin.x - size.width * zoomOrigin.relX,
      y: zoomOrigin.y - size.height * zoomOrigin.relY,
    };
    const zoomedViewBox = {
      ...absolutZoomPos,
      ...size,
    };
    // clamp viewbox to not go out of bounds (should not be neccessary, still keep just in case)
    zoomedViewBox.x = Math.max(0, zoomedViewBox.x);
    zoomedViewBox.y = Math.max(0, zoomedViewBox.y);
    if (zoomedViewBox.x + zoomedViewBox.width > viewBox.width) {
      zoomedViewBox.x = viewBox.width - zoomedViewBox.width;
      if (zoomedViewBox.x < 0) {
        zoomedViewBox.x = 0;
        zoomedViewBox.width = viewBox.width;
      }
    }
    if (zoomedViewBox.y + zoomedViewBox.height > viewBox.height) {
      zoomedViewBox.y = viewBox.height - zoomedViewBox.height;
      if (zoomedViewBox.y < 0) {
        zoomedViewBox.y = 0;
        zoomedViewBox.height = viewBox.height;
      }
    }
    return zoomedViewBox;
  }, [viewBox, zoomFactor, zoomOrigin]);
  const lastZoomedViewBox = useRef(zoomedViewBox);
  lastZoomedViewBox.current = zoomedViewBox;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
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

      if (handle === "resize") {
        // resizing asset
        setIsResizing(true);
      } else if (handle === "rotate") {
        // rotating asset
        setIsRotating(true);
      } else {
        // dragging asset
        setIsDragging(true);
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
    [selectedAssets, readonly]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        userSelectedAssets.length === 0 ||
        (!isDragging && !isResizing && !isRotating)
      )
        return;

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

      if (isDragging) {
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

            return {
              ...asset,
              position: {
                x: startPos.x + dx,
                y: startPos.y + dy,
              },
            };
          })
        );
      } else if (isResizing || isRotating) {
        const selected = assets.filter((a) =>
          userSelectedAssets.includes(a._id)
        );
        if (selected.length === 0) return;

        if (isRotating || e.ctrlKey) {
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
    [isDragging, isResizing, isRotating, userSelectedAssets, actionStart]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (isDragging || isResizing || isRotating) {
        onAssetChange(
          userSelectedAssets
            .map((id) => assetsRef.current.find((a) => a._id === id)!)
            .filter(Boolean)
        );
        actionEndTime.current = Date.now();
      }
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    },
    [isDragging, isResizing, isRotating, userSelectedAssets]
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        // zoom
        const svg = svgRef.current;
        if (!svg) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(
          svg.getScreenCTM()?.inverse() || new DOMMatrix()
        );

        setZoomOrigin({
          x: svgP.x,
          y: svgP.y,
          relX:
            (svgP.x - lastZoomedViewBox.current.x) /
            lastZoomedViewBox.current.width,
          relY:
            (svgP.y - lastZoomedViewBox.current.y) /
            lastZoomedViewBox.current.height,
        });
        setZoomFactor((factor) =>
          clamp(factor + e.deltaY * ZOOM_MODIFIER, MIN_ZOOM_FACTOR, 1)
        );
      } else {
        // scroll
        let deltaX = e.deltaX;
        let deltaY = e.deltaY;
        if (e.shiftKey && e.deltaX === 0) {
          deltaX = deltaY;
          deltaY = 0;
        }
        setZoomOrigin((org) => ({
          ...org,
          x: clamp(org.x + deltaX * SCROLL_MODIFIER, 0, viewBox.width),
          y: clamp(org.y + deltaY * SCROLL_MODIFIER, 0, viewBox.height),
        }));
      }
    },
    [setZoomOrigin, setZoomFactor]
  );

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      window.addEventListener("mousemove", handleMouseMove, { passive: false });
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, isRotating, handleMouseUp, handleMouseMove]);

  // add non-passive handleWheel event listener to svg
  useEffect(() => {
    if (!svgRef.current) return;
    svgRef.current.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      svgRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [svgRef.current, handleWheel]);

  useKeys([
    {
      shortcut: ["Backspace", "Delete"],
      action() {
        if (document.activeElement !== svgRef.current) return;
        onAssetRemove(userSelectedAssets);
      },
      active: !readonly,
    },
    {
      shortcut: ["Escape"],
      action() {
        if (document.activeElement !== svgRef.current) return;
        onDeselect(userSelectedAssets);
      },
      active: !readonly,
    },
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
        className="w-full h-full"
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
        />

        {/* Render assets */}
        {sortedAssets.map((asset) => {
          const render = renderAsset(
            asset,
            selectedAssets
              .filter((s) => s._id === asset._id)
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rotateVector(
  vector: { x: number; y: number },
  angle: number
): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: vector.x * Math.cos(radians) - vector.y * Math.sin(radians),
    y: vector.x * Math.sin(radians) + vector.y * Math.cos(radians),
  };
}

function resizeAsset(
  asset: Pick<CanvasAsset, "size" | "position" | "rotation">,
  leveledDelta: { x: number; y: number },
  makeSquare: boolean
): Pick<CanvasAsset, "size" | "position"> {
  let newSize = clampAssetSize({
    width: asset.size.width + leveledDelta.x,
    height: asset.size.height + leveledDelta.y,
  });
  if (makeSquare) {
    const maxSide = Math.max(newSize.width, newSize.height);
    newSize = { width: maxSide, height: maxSide };
  }
  const newPosition = {
    x: asset.position.x - (newSize.width - asset.size.width) / 2,
    y: asset.position.y - (newSize.height - asset.size.height) / 2,
  };
  return {
    size: newSize,
    position: newPosition,
  };
}

export function clampAssetSize(
  size: { width: number; height: number },
  min: number = MIN_ASSET_SIZE,
  max: number = MAX_ASSET_SIZE
): { width: number; height: number } {
  return {
    width: clamp(size.width, min, max),
    height: clamp(size.height, min, max),
  };
}
