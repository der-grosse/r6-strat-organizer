"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import SVGAsset from "./SVGAsset";
import { ArrowCorner } from "@/lib/types/asset.types";
import { useKeys } from "../../hooks/useKey";
import isKeyDown from "../../hooks/isKeyDown";
import MapBackground from "./MapBackground";
import { R6Map } from "@/lib/types/strat.types";
import { Asset, PlacedAsset } from "@/lib/types/asset.types";
import { TeamMember } from "@/lib/types/team.types";
import { useUser } from "../../context/UserContext";
import { cn } from "@/lib/utils";
import { useViewport } from "./useViewport";
import { useAssetInteraction } from "./useAssetInteraction";
import { useMarqueeSelection } from "./useMarqueeSelection";
import { clamp } from "./Canvas.functions";
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
    () => selectedAssets.filter((s) => s.userID === user?._id).map((s) => s.assetID),
    [selectedAssets, user?._id],
  );

  const svgRef = useRef<SVGSVGElement>(null!);

  const [assets, setAssets] = useState<A[]>(propAssets);
  const assetsRef = useRef<A[]>(propAssets);
  assetsRef.current = assets;

  // live viewBox dimensions, shared with interaction hooks for clamping (kept in
  // a ref so event handlers always read the current value without re-binding)
  const viewBoxRef = useRef({ width: CANVAS_BASE_SIZE, height: (CANVAS_BASE_SIZE / 4) * 3 });

  // asset direct-manipulation: drag / resize / rotate / arrow endpoints
  const { activeAction, actionEndTime, onAssetMouseDown, onAssetTouchStart } = useAssetInteraction({
    svgRef,
    assetsRef,
    setAssets,
    userSelectedAssets,
    viewBoxRef,
    onAssetChange,
    onSelect,
    onDeselect,
    readonly,
  });

  // update assets when prop changes
  useEffect(() => {
    setAssets((assets) => {
      const newAssets = propAssets.filter((a) => !assets.some((b) => b._id === a._id));
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

  const sortedAssets = useMemo(() => {
    return [
      ...assets.filter((a) => !userSelectedAssets.includes(a._id)),
      ...(userSelectedAssets.map((s) => assets.find((a) => a._id === s)).filter(Boolean) as A[]),
    ];
  }, [assets, userSelectedAssets]);

  // viewport management with zoom and pan event listeners
  const { viewBox, zoomedViewBox, zoomFactor, canDragViewport, isDraggingViewport, handleWheel } =
    useViewport({
      map,
      svgRef,
      baseWidth: CANVAS_BASE_SIZE,
      isViewportMovable: activeAction === "none",
    });
  viewBoxRef.current = viewBox;

  // marquee (rubber-band) multi-selection — disabled while panning the viewport
  const { marqueeRect, marqueeEndTime, startMarquee } = useMarqueeSelection({
    svgRef,
    assetsRef,
    userSelectedAssets,
    onSelect,
    onDeselect,
    disabled: !!readonly || canDragViewport,
  });

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
        onSelect(assets.map((a) => a._id).filter((id) => !userSelectedAssets.includes(id)));
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
          canDragViewport && (isDraggingViewport ? "cursor-grabbing" : "cursor-grab"),
        )}
        style={{
          touchAction: activeAction !== "none" ? "none" : "auto",
        }}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={(e) => {
          if (readonly) return;
          startMarquee(e);
        }}
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
          const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse() || new DOMMatrix());

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
          // prevent deselecting assets right after a drag-based interaction
          // (rotate/resize can register as a click, and marquee select also ends
          // with a click on the background)
          if (Date.now() - actionEndTime.current < 500) return;
          if (Date.now() - marqueeEndTime.current < 500) return;
          onDeselect(userSelectedAssets);
        }}
        tabIndex={readonly ? undefined : 0}
        focusable
      >
        {/* Global filter definitions */}
        <defs>
          <filter id="globalDropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1" floodOpacity="0.9" floodColor="#000000" />
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
            selectedAssets.filter((s) => s.assetID === asset._id).map((s) => s.userID),
            userSelectedAssets.at(-1) === asset._id,
          );
          return (
            <SVGAsset
              key={asset._id}
              position={asset.position}
              size={asset.size}
              rotation={asset.rotation || 0}
              onMouseDown={(e, handle) => onAssetMouseDown(e, asset._id, handle)}
              onTouchStart={(e, handle) => onAssetTouchStart(e, asset._id, handle)}
              onDoubleClick={() => onAssetDoubleClick?.(asset)}
              selected={userSelectedAssets.includes(asset._id)}
              ctrlKeyDown={ctrlKeyDown}
              menu={render.menu}
              zoom={zoomFactor}
              readonly={readonly}
              nativeSvg={asset.type === "operator"}
              arrowStartCorner={
                asset.type === "arrow"
                  ? ((asset as CanvasAsset & { startCorner?: ArrowCorner }).startCorner ?? "tl")
                  : undefined
              }
            >
              {render.asset}
            </SVGAsset>
          );
        })}

        {/* Marquee selection rectangle */}
        {marqueeRect && (
          <rect
            x={marqueeRect.x}
            y={marqueeRect.y}
            width={marqueeRect.width}
            height={marqueeRect.height}
            className="pointer-events-none fill-stone-400/15 stroke-stone-400"
            strokeWidth={1}
            strokeDasharray="6 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
