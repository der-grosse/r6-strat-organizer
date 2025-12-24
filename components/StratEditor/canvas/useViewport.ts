import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { R6Map } from "@/lib/types/strat.types";
import isKeyDown from "../../hooks/isKeyDown";

type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ZoomOrigin = {
  x: number;
  y: number;
  relX: number;
  relY: number;
};

const DEFAULT_BASE_WIDTH = 2400;
const MIN_ZOOM_FACTOR = 0.15;
const ZOOM_MODIFIER = 0.004;

export interface UseViewportOptions {
  map: R6Map | null;
  svgRef: React.RefObject<SVGSVGElement>;
  baseWidth?: number;
  isViewportMovable?: boolean;
}

export function calculateZoomedViewBox(
  viewBox: Pick<ViewBox, "width" | "height">,
  zoomFactor: number,
  zoomOrigin: ZoomOrigin
): ViewBox {
  const size = {
    width: viewBox.width * zoomFactor,
    height: viewBox.height * zoomFactor,
  };
  const absolutZoomPos = {
    x: zoomOrigin.x - size.width * zoomOrigin.relX,
    y: zoomOrigin.y - size.height * zoomOrigin.relY,
  };
  const zoomedViewBox: ViewBox = {
    ...absolutZoomPos,
    ...size,
  };
  // clamp viewbox to not go out of bounds (should not be necessary, still keep just in case)
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
}

export function setSvgViewBox(svg: SVGSVGElement | null, viewBox: ViewBox) {
  if (!svg) return;
  svg.setAttribute(
    "viewBox",
    `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useViewport({
  map,
  svgRef,
  baseWidth = DEFAULT_BASE_WIDTH,
  isViewportMovable = true,
}: UseViewportOptions) {
  const baseHeight = (baseWidth / 4) * 3;
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    width: baseWidth,
    height: baseHeight,
  });
  const viewBoxRef = useRef<ViewBox>(viewBox);

  // Calculate viewBox based on map dimensions
  useEffect(() => {
    if (!map) return;
    const aspectRatio =
      map.floors.length === 1 || map.floors.length > 2 ? 4 / 3 : 8 / 3;
    const width = baseWidth;
    const height = width / aspectRatio;
    setViewBox((prev) => ({ ...prev, width, height }));
  }, [map, baseWidth]);

  useEffect(() => {
    viewBoxRef.current = viewBox;
  }, [viewBox]);

  const [zoomFactor, setZoomFactor] = useState(1);
  const zoomFactorRef = useRef(zoomFactor);
  useEffect(() => {
    zoomFactorRef.current = zoomFactor;
  }, [zoomFactor]);

  const [zoomOrigin, setZoomOrigin] = useState<ZoomOrigin>({
    // absolute cursor pos in svg coords
    x: baseWidth / 4,
    y: baseHeight / 4,
    // relative cursor pos in svg
    relX: 0.5,
    relY: 0.5,
  });
  const zoomOriginRef = useRef(zoomOrigin);
  useEffect(() => {
    zoomOriginRef.current = zoomOrigin;
  }, [zoomOrigin]);

  const debouncedZoomCommit = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const zoomedViewBox = useMemo(
    () => calculateZoomedViewBox(viewBox, zoomFactor, zoomOrigin),
    [viewBox, zoomFactor, zoomOrigin]
  );
  const lastZoomedViewBox = useRef(zoomedViewBox);
  useEffect(() => {
    lastZoomedViewBox.current = zoomedViewBox;
  }, [zoomedViewBox]);

  // keep the SVG viewBox in sync with the computed one
  useEffect(() => {
    setSvgViewBox(svgRef.current, zoomedViewBox);
  }, [zoomedViewBox, svgRef]);

  const panByDelta = useCallback(
    (dx: number, dy: number) => {
      const nextOrigin = {
        ...zoomOriginRef.current,
        x: clamp(zoomOriginRef.current.x - dx, 0, viewBoxRef.current.width),
        y: clamp(zoomOriginRef.current.y - dy, 0, viewBoxRef.current.height),
      };
      zoomOriginRef.current = nextOrigin;
      const nextViewBox = calculateZoomedViewBox(
        viewBoxRef.current,
        zoomFactorRef.current,
        nextOrigin
      );
      setSvgViewBox(svgRef.current, nextViewBox);
    },
    [svgRef]
  );

  const commitPanOrigin = useCallback(() => {
    setZoomOrigin(zoomOriginRef.current);
  }, []);

  // clear any pending zoom commit on unmount
  useEffect(() => {
    return () => {
      if (debouncedZoomCommit.current) {
        clearTimeout(debouncedZoomCommit.current);
      }
    };
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        const svg = svgRef.current;
        if (!svg) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(
          svg.getScreenCTM()?.inverse() || new DOMMatrix()
        );

        const nextOrigin = {
          x: svgP.x,
          y: svgP.y,
          relX:
            (svgP.x - lastZoomedViewBox.current.x) /
            lastZoomedViewBox.current.width,
          relY:
            (svgP.y - lastZoomedViewBox.current.y) /
            lastZoomedViewBox.current.height,
        };
        const nextZoom = clamp(
          zoomFactorRef.current + e.deltaY * ZOOM_MODIFIER,
          MIN_ZOOM_FACTOR,
          1
        );

        // update refs immediately to avoid per-event React rerenders
        zoomOriginRef.current = nextOrigin;
        zoomFactorRef.current = nextZoom;

        const nextViewBox = calculateZoomedViewBox(
          viewBoxRef.current,
          zoomFactorRef.current,
          zoomOriginRef.current
        );
        lastZoomedViewBox.current = nextViewBox;
        setSvgViewBox(svgRef.current, nextViewBox);

        // debounce committing to React state to reduce render churn
        if (debouncedZoomCommit.current) {
          clearTimeout(debouncedZoomCommit.current);
        }
        debouncedZoomCommit.current = setTimeout(() => {
          setZoomOrigin(zoomOriginRef.current);
          setZoomFactor(zoomFactorRef.current);
          debouncedZoomCommit.current = null;
        }, 25);
      } else {
        let deltaX = e.deltaX;
        let deltaY = e.deltaY;
        if (e.shiftKey && e.deltaX === 0) {
          deltaX = deltaY;
          deltaY = 0;
        }
        setZoomOrigin((org) => ({
          ...org,
          x: clamp(org.x + deltaX * 0.5, 0, viewBoxRef.current.width),
          y: clamp(org.y + deltaY * 0.5, 0, viewBoxRef.current.height),
        }));
      }
    },
    [svgRef]
  );

  // drag viewport with spacebar
  const [dragViewportStart, setDragViewportStart] = useState({ x: 0, y: 0 });
  const spaceDown = isKeyDown(" ");
  const [isDraggingViewport, setIsDraggingViewport] = useState(false);
  // allow panning when holding space (any mouse button) or using middle mouse alone
  const canDragViewport =
    isViewportMovable && (spaceDown || isDraggingViewport);

  // add mousemove and mouseup listeners for dragging the viewport
  useEffect(() => {
    if (!isViewportMovable) return;
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingViewport) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        svg.getScreenCTM()?.inverse() || new DOMMatrix()
      );
      const dx = svgP.x - dragViewportStart.x;
      const dy = svgP.y - dragViewportStart.y;
      panByDelta(dx, dy);
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      if (!isDraggingViewport) return;
      setDragViewportStart({ x: 0, y: 0 });
      // commit the imperatively updated origin back into React state
      commitPanOrigin();
      setIsDraggingViewport(false);
    };

    const mouseDownListener = (e: MouseEvent) => {
      const middleMousePressed = e.button === 1;
      if (!canDragViewport && !middleMousePressed && !spaceDown) return;
      const svg = svgRef.current;
      if (!svg) return;
      if (middleMousePressed) {
        e.preventDefault();
      }
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        svg.getScreenCTM()?.inverse() || new DOMMatrix()
      );
      setDragViewportStart({
        x: svgP.x,
        y: svgP.y,
      });
      setIsDraggingViewport(true);
    };

    window.addEventListener("mousemove", handleWindowMouseMove, {
      passive: true,
    });
    window.addEventListener("mouseup", handleWindowMouseUp);
    svgRef.current?.addEventListener("mousedown", mouseDownListener);
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      svgRef.current?.removeEventListener("mousedown", mouseDownListener);
    };
  }, [
    isViewportMovable,
    isDraggingViewport,
    dragViewportStart.x,
    dragViewportStart.y,
    spaceDown,
    panByDelta,
    commitPanOrigin,
    svgRef,
  ]);

  return {
    viewBox,
    zoomedViewBox,
    zoomFactor,
    zoomOrigin,
    isDraggingViewport,
    canDragViewport,
    handleWheel,
  };
}
