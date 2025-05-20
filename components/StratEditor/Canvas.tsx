"use client";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
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
  renderAsset: (asset: A, selected: boolean) => React.ReactNode;
}

// should be a multiple of 4 and 3 to have nicer numbers for aspect ratio
const BASE_SIZE = 1200;
const MIN_ZOOM_FACTOR = 0.15;
const MIN_ASSET_SIZE = 10;
const DRAG_DEADZONE = 5;
const ZOOM_MODIFIER = 0.004;
const SCROLL_MODIFIER = 0.5;

export default function StratEditorCanvas<A extends Asset>({
  map,
  assets,
  onAssetChange,
  renderAsset,
}: Readonly<CanvasProps<A>>) {
  const assetsRef = useRef<A[]>(assets);
  assetsRef.current = assets;

  const svgRef = useRef<SVGSVGElement>(null);

  const [viewBox, setViewBox] = useState({
    width: BASE_SIZE,
    height: (BASE_SIZE / 4) * 3,
  });
  // Calculate viewBox based on map dimensions
  useEffect(() => {
    if (map) {
      const aspectRatio = map.floors.length > 2 ? 4 / 3 : 8 / 3;
      const width = BASE_SIZE;
      const height = width / aspectRatio;
      setViewBox({ width, height });
    }
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
  const [actionStart, setActionStart] = useState({
    x: 0,
    y: 0,
    startPositions: [] as {
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }[],
  });

  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, assetId: string, isResizeHandle: boolean) => {
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

      if (isResizeHandle) {
        // resizing asset
        setIsResizing(true);
      } else {
        // dragging asset
        setIsDragging(true);
      }
      setActionStart({
        x: svgP.x,
        y: svgP.y,
        startPositions: assetsRef.current
          .filter((a) => selectedAssets.includes(a.id) || a.id === assetId)
          .map((a) => ({
            ...a.position,
            ...a.size,
            id: a.id,
          })),
      });
    },
    [selectedAssets]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (selectedAssets.length === 0 || (!isDragging && !isResizing)) return;

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

        onAssetChange(
          assets.map((asset) =>
            selectedAssets.includes(asset.id)
              ? (() => {
                  const startPos = actionStart.startPositions.find(
                    (pos) => pos.id === asset.id
                  );
                  if (!startPos) return asset;

                  return {
                    ...asset,
                    position: {
                      x: startPos.x + dx,
                      y: startPos.y + dy,
                    },
                  };
                })()
              : asset
          )
        );
      } else if (isResizing) {
        const selected = assets.filter((a) => selectedAssets.includes(a.id));
        if (selected.length > 0) {
          const deltaX = svgP.x - actionStart.x;
          const deltaY = svgP.y - actionStart.y;

          const makeSquare = e.shiftKey;

          onAssetChange(
            assets.map((a) =>
              selectedAssets.includes(a.id)
                ? {
                    ...a,
                    size: (() => {
                      const startPos = actionStart.startPositions.find(
                        (pos) => pos.id === a.id
                      );
                      if (!startPos) return a.size;
                      const newSize = {
                        width: Math.max(
                          MIN_ASSET_SIZE,
                          startPos.width + deltaX
                        ),
                        height: Math.max(
                          MIN_ASSET_SIZE,
                          startPos.height + deltaY
                        ),
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
    },
    [isDragging, isResizing, selectedAssets, actionStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

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
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove, { passive: false });
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseUp, handleMouseMove]);

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
        onAssetChange(assets.filter((a) => !selectedAssets.includes(a.id)));
      },
    },
    {
      shortcut: ["Escape"],
      action() {
        setSelectedAssets([]);
      },
    },
    {
      shortcut: {
        key: "a",
        ctrlKey: true,
      },
      action() {
        setSelectedAssets(assets.map((a) => a.id));
      },
    },
  ]);

  return (
    <div className="relative overflow-hidden w-full h-full">
      <svg
        ref={svgRef}
        viewBox={`${zoomedViewBox.x} ${zoomedViewBox.y} ${zoomedViewBox.width} ${zoomedViewBox.height}`}
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
            {renderAsset(
              asset,
              selectedAssets.length === 1 && selectedAssets[0] === asset.id
            )}
          </SVGAsset>
        ))}
      </svg>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
