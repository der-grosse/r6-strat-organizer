"use client";
import { useRef, useState, useEffect } from "react";
import SVGAsset from "./SVGAsset";
import { useKeys } from "../hooks/useKey";

interface Asset {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface CanvasProps<A extends Asset> {
  map: R6Map | null;
  assets: A[];
  onAssetChange: (assets: A[]) => void;
  renderAsset: (asset: A) => React.ReactNode;
}

const BASE_SIZE = 1200;
const MIN_ASSET_SIZE = 10;
const DRAG_DEADZONE = 5;

export default function StratEditorCanvas<A extends Asset>({
  map,
  assets,
  onAssetChange,
  renderAsset,
}: Readonly<CanvasProps<A>>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({
    width: BASE_SIZE,
    height: (BASE_SIZE / 4) * 3,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [activeAssetID, setActiveAssetID] = useState<string | null>(null);

  // Calculate viewBox based on map dimensions
  useEffect(() => {
    if (map) {
      const aspectRatio = map.floors.length > 2 ? 4 / 3 : 8 / 3;
      const width = BASE_SIZE;
      const height = width / aspectRatio;
      setViewBox({ width, height });
    }
  }, [map]);

  const handleMouseDown = (
    e: React.MouseEvent,
    assetId: string,
    isResizeHandle: boolean
  ) => {
    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(
      svg.getScreenCTM()?.inverse() || new DOMMatrix()
    );

    if (e.shiftKey) {
      setSelectedAssets((prev) => [...prev, assetId]);
    } else {
      setSelectedAssets([assetId]);
    }
    setActiveAssetID(assetId);

    if (isResizeHandle) {
      setIsResizing(true);
      setResizeStart({ x: svgP.x, y: svgP.y });
    } else {
      setIsDragging(true);
      const asset = assets.find((a) => a.id === assetId);
      if (asset) {
        setDragOffset({
          x: svgP.x - asset.position.x,
          y: svgP.y - asset.position.y,
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (selectedAssets.length === 0 || (!isDragging && !isResizing)) return;

    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(
      svg.getScreenCTM()?.inverse() || new DOMMatrix()
    );

    if (isDragging) {
      const dx = svgP.x - dragOffset.x;
      const dy = svgP.y - dragOffset.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < DRAG_DEADZONE) return;

      const activeAsset = assets.find((a) => a.id === activeAssetID);
      if (!activeAsset) return;

      onAssetChange(
        assets.map((asset) =>
          selectedAssets.includes(asset.id)
            ? (() => {
                const offsetX = activeAsset.position.x - asset.position.x;
                const offsetY = activeAsset.position.y - asset.position.y;
                return {
                  ...asset,
                  position: {
                    x: svgP.x - dragOffset.x - offsetX,
                    y: svgP.y - dragOffset.y - offsetY,
                  },
                };
              })()
            : asset
        )
      );
    } else if (isResizing) {
      const selected = assets.filter((a) => selectedAssets.includes(a.id));
      if (selected.length > 0) {
        const deltaX = svgP.x - resizeStart.x;
        const deltaY = svgP.y - resizeStart.y;

        const makeSquare = e.shiftKey;

        onAssetChange(
          assets.map((a) =>
            selectedAssets.includes(a.id)
              ? {
                  ...a,
                  size: (() => {
                    const newSize = {
                      width: Math.max(MIN_ASSET_SIZE, a.size.width + deltaX),
                      height: Math.max(MIN_ASSET_SIZE, a.size.height + deltaY),
                    };
                    if (!makeSquare) return newSize;
                    const maxSide = Math.max(newSize.width, newSize.height);
                    return {
                      width: maxSide,
                      height: maxSide,
                    };
                  })(),
                }
              : a
          )
        );
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove, { passive: false });
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    selectedAssets,
    dragOffset,
    resizeStart,
    activeAssetID,
  ]);

  useKeys([
    {
      shortcut: ["Backspace", "Delete"],
      action() {
        onAssetChange(assets.filter((a) => !selectedAssets.includes(a.id)));
      },
    },
  ]);

  return (
    <div className="relative overflow-hidden w-full h-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedAssets([]);
        }}
      >
        {/* Render map background */}
        {map?.floors.map((floor, i) => (
          <image
            key={floor.floor}
            href={floor.src}
            width={viewBox.width / (map.floors.length > 2 ? 2 : 1)}
            height={viewBox.height / (map.floors.length > 2 ? 2 : 1)}
            x={i % 2 === 0 ? 0 : viewBox.width / 2}
            y={(Math.floor(i / 2) * viewBox.height) / 2}
            preserveAspectRatio="xMidYMid meet"
            className="pointer-events-none"
          />
        ))}

        {/* Render assets */}
        {assets.map((asset) => (
          <SVGAsset
            key={asset.id}
            id={asset.id}
            position={asset.position}
            size={asset.size}
            onMouseDown={(e, isResizeHandle) =>
              handleMouseDown(e, asset.id, isResizeHandle)
            }
            selected={selectedAssets.includes(asset.id)}
          >
            {renderAsset(asset)}
          </SVGAsset>
        ))}
      </svg>
    </div>
  );
}
