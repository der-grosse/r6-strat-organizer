"use client";

import { useMemo, useState } from "react";
import useMountAssets from "./canvas/useMountedAssets";
import StratEditorCanvas, { CANVAS_BASE_SIZE } from "./canvas/Canvas";
import MAPS from "@/lib/static/maps";
import { R6Map, Strat } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";
import { PlacedAsset } from "@/lib/types/asset.types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { deepCopy, filterNull } from "../Objects";
import { DEFENDERS } from "@/lib/static/operator";

export interface StratViewerProps {
  strat: Strat;
  team: FullTeam;
  assetModifier?: (assets: PlacedAsset[]) => PlacedAsset[];
}

export default function StratViewer({
  team,
  strat,
  assetModifier,
}: StratViewerProps) {
  const bannedOperators = useQuery(api.bannedOps.get);

  const { renderAsset } = useMountAssets(
    { team, stratPositions: strat.stratPositions },
    {
      deleteAssets(assets) {},
      updateAssets(assets) {},
    },
  );

  const map = useMemo(
    () => MAPS.find((map) => map.name === strat.map) ?? null,
    [strat.map],
  );

  const allAssets =
    useQuery(api.strats.getAssets, { stratID: strat._id }) ?? [];

  const assets = useMemo(() => {
    if (assetModifier) {
      return assetModifier(allAssets);
    }
    return allAssets;
  }, [allAssets, assetModifier]);

  const { assets: clampedAssets, map: clampedMap } = useMemo(() => {
    if (!map) return { assets, map };
    const modifiedAssets = applyOperatorBans(
      assets,
      bannedOperators ?? [],
      strat,
    );
    return removeUnusedFloors(modifiedAssets, map);
  }, [assets, map, bannedOperators, strat]);

  return (
    <StratEditorCanvas
      map={clampedMap}
      assets={clampedAssets}
      renderAsset={renderAsset}
      selectedAssets={[]}
      onDeselect={() => {}}
      onSelect={() => {}}
      onAssetAdd={() => {}}
      onAssetChange={() => {}}
      onAssetRemove={() => {}}
      readonly
      showFloorNames={strat.showFloorNames}
    />
  );
}

function getViewBoxDimensions(floorCount: number, baseWidth: number) {
  const aspectRatio = floorCount === 1 || floorCount > 2 ? 4 / 3 : 8 / 3;
  return { width: baseWidth, height: baseWidth / aspectRatio };
}

function removeUnusedFloors(
  assets: PlacedAsset[],
  map: R6Map,
): { assets: PlacedAsset[]; map: R6Map } {
  const baseWidth = CANVAS_BASE_SIZE;

  // Use the actual viewBox dimensions matching useViewport's logic
  const origViewBox = getViewBoxDimensions(map.floors.length, baseWidth);

  const floors = map.floors.map((f, i) => {
    const { x, y, width, height } = getBoundingBox(
      i,
      map.floors.length,
      origViewBox,
    );
    return {
      assets: [] as PlacedAsset[],
      boundingBox: {
        x,
        y,
        width,
        height,
      },
      ...f,
    };
  });

  for (const asset of assets) {
    const floor = floors.find((f) => {
      const assetRight = asset.position.x + asset.size.width;
      const assetBottom = asset.position.y + asset.size.height;
      const floorRight = f.boundingBox.x + f.boundingBox.width;
      const floorBottom = f.boundingBox.y + f.boundingBox.height;
      return (
        asset.position.x >= f.boundingBox.x &&
        assetRight <= floorRight &&
        asset.position.y >= f.boundingBox.y &&
        assetBottom <= floorBottom &&
        asset.position.x < floorRight &&
        asset.position.y < floorBottom
      );
    });
    if (floor) {
      floor.assets.push(deepCopy(asset));
    } else {
      console.debug("Asset not on any floor, skipping", asset);
    }
  }

  const usedFloors = floors.filter((f) => f.assets.length > 0);

  if (usedFloors.length === 0) {
    return { assets, map };
  }

  // Compute the new viewBox dimensions for the reduced floor count
  const newViewBox = getViewBoxDimensions(usedFloors.length, baseWidth);

  for (const [i, floor] of usedFloors.entries()) {
    const { x, y, width, height } = getBoundingBox(
      i,
      usedFloors.length,
      newViewBox,
    );

    if (
      floor.boundingBox.x === x &&
      floor.boundingBox.y === y &&
      floor.boundingBox.width === width &&
      floor.boundingBox.height === height
    ) {
      continue;
    }

    const scaleX = width / floor.boundingBox.width;
    const scaleY = height / floor.boundingBox.height;

    // Scale and reposition assets to match the new floor layout
    for (const asset of floor.assets) {
      const relX = asset.position.x - floor.boundingBox.x;
      const relY = asset.position.y - floor.boundingBox.y;
      asset.position.x = x + relX * scaleX;
      asset.position.y = y + relY * scaleY;
      asset.size.width *= scaleX;
      asset.size.height *= scaleY;
    }
  }

  return {
    assets: usedFloors.flatMap((f) => f.assets),
    map: {
      ...map,
      floors: usedFloors.map((f) => {
        const { assets, boundingBox, ...floor } = f;
        return floor;
      }),
    },
  };
}
function getBoundingBox(
  floorIndex: number,
  floorCount: number,
  baseViewbox: { width: number; height: number },
) {
  const x = floorIndex % 2 === 0 ? 0 : baseViewbox.width / 2;
  const y = (Math.floor(floorIndex / 2) * baseViewbox.height) / 2;
  const width = baseViewbox.width / (floorCount > 1 ? 2 : 1);
  const height = baseViewbox.height / (floorCount > 2 ? 2 : 1);
  return { x, y, width, height };
}

function applyOperatorBans(
  assets: PlacedAsset[],
  bannedOperators: string[],
  strat: Strat,
): PlacedAsset[] {
  return filterNull(
    assets.map((asset) => {
      switch (asset.type) {
        case "operator": {
          if (!bannedOperators.includes(asset.operator)) return asset;
          const stratPosition = strat.stratPositions.find(
            (sp) => sp._id === asset.stratPositionID,
          );
          if (!stratPosition) return asset;
          const op = stratPosition.pickedOperators.find(
            (o) => !bannedOperators.includes(o.operator),
          );
          if (!op) return asset;
          return { ...asset, operator: op.operator };
        }
        case "gadget": {
          const operator = DEFENDERS.find(
            (op) => "gadget" in op && op.gadget === asset.gadget,
          )?.name;
          if (!operator || !bannedOperators.includes(operator)) return asset;
          const stratPosition = strat.stratPositions.find(
            (sp) => sp._id === asset.stratPositionID,
          );
          if (!stratPosition) return asset;
          const hasValidOperator = stratPosition.pickedOperators.some(
            (o) => !bannedOperators.includes(o.operator),
          );
          // if no other valid operator is available, keep the gadget so that user can select alternative themself
          if (!hasValidOperator) return asset;
          return null;
        }
        default:
          return asset;
      }
    }),
  );
}
