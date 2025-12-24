import { CanvasAsset } from "./Canvas";

let MIN_ASSET_SIZE = 16;
let MAX_ASSET_SIZE = 400;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function rotateVector(
  vector: { x: number; y: number },
  angle: number
): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: vector.x * Math.cos(radians) - vector.y * Math.sin(radians),
    y: vector.x * Math.sin(radians) + vector.y * Math.cos(radians),
  };
}

export function resizeAsset(
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
