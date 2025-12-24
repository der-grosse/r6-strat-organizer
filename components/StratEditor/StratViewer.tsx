"use client";

import { useMemo } from "react";
import useMountAssets from "./canvas/useMountedAssets";
import StratEditorCanvas from "./canvas/Canvas";
import MAPS from "@/lib/static/maps";
import { Strat } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";
import { PlacedAsset } from "@/lib/types/asset.types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  const { renderAsset, UI } = useMountAssets(
    { team, stratPositions: strat.stratPositions },
    {
      deleteAsset(asset) {},
      updateAsset(asset) {},
    }
  );

  const map = useMemo(
    () => MAPS.find((map) => map.name === strat.map) ?? null,
    [strat.map]
  );

  const allAssets =
    useQuery(api.strats.getAssets, { stratID: strat._id }) ?? [];

  const assets = useMemo(() => {
    if (assetModifier) {
      return assetModifier(allAssets);
    }
    return allAssets;
  }, [allAssets, assetModifier]);

  return (
    <StratEditorCanvas
      map={map}
      assets={assets}
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
