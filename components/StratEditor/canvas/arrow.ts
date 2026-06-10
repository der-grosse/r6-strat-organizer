import { ArrowCorner, Position, Size } from "@/lib/types/asset.types";

const OPPOSITE_CORNER: Record<ArrowCorner, ArrowCorner> = {
  tl: "br",
  br: "tl",
  tr: "bl",
  bl: "tr",
};

/** Absolute position of a bounding box corner. */
export function cornerPoint(corner: ArrowCorner, position: Position, size: Size): Position {
  switch (corner) {
    case "tl":
      return { x: position.x, y: position.y };
    case "tr":
      return { x: position.x + size.width, y: position.y };
    case "bl":
      return { x: position.x, y: position.y + size.height };
    case "br":
      return { x: position.x + size.width, y: position.y + size.height };
  }
}

/** The two endpoints of an arrow (tail = start, head = end). */
export function getArrowEndpoints(
  position: Position,
  size: Size,
  startCorner: ArrowCorner,
): { start: Position; end: Position } {
  return {
    start: cornerPoint(startCorner, position, size),
    end: cornerPoint(OPPOSITE_CORNER[startCorner], position, size),
  };
}

/**
 * Derive the box model (position/size) and the start corner from two arbitrary
 * endpoints. Used when a line end is dragged to a new location.
 */
export function arrowGeomFromEndpoints(
  start: Position,
  end: Position,
): { position: Position; size: Size; startCorner: ArrowCorner } {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  // Which corner of the bounding box the start (tail) point sits at.
  const startRight = start.x > end.x;
  const startBottom = start.y > end.y;
  const startCorner: ArrowCorner = startBottom
    ? startRight
      ? "br"
      : "bl"
    : startRight
      ? "tr"
      : "tl";

  return { position: { x, y }, size: { width, height }, startCorner };
}
