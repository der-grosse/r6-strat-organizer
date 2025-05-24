"use client";
import { useCallback, useMemo, useState } from "react";
import MAPS from "@/src/static/maps";
import StratEditorLayout from "./Layout";
import StratEditorCanvas from "./Canvas";
import useMountAssets from "./Assets";
import {
  addAsset,
  deleteStratAssets,
  updateStratAssets,
} from "@/src/strats/strats";

interface StratEditorProps {
  strat: Strat;
  team: Team;
}

export function StratEditor({ strat, team }: Readonly<StratEditorProps>) {
  const [assets, setAssets] = useState<PlacedAsset[]>(strat.assets);
  const getHightestID = useCallback(
    (assets: PlacedAsset[]) =>
      assets.reduce((acc, asset) => {
        const id = Number(asset.id.split("-").at(-1));
        if (isNaN(id)) return acc;
        return Math.max(acc, id);
      }, 0),
    []
  );

  const { renderAsset, UI } = useMountAssets(
    { team, operators: strat.operators },
    {
      deleteAsset(asset) {
        setAssets((assets) => assets.filter((a) => a.id !== asset.id));
        deleteStratAssets(strat.id, [asset.id]);
      },
      updateAsset(asset) {
        setAssets((assets) =>
          assets.map((a) => (a.id === asset.id ? asset : a))
        );
        updateStratAssets(strat.id, [asset]);
      },
    }
  );

  const map = useMemo(
    () => MAPS.find((map) => map.name === strat.map) ?? null,
    [strat.map]
  );

  return (
    <StratEditorLayout
      onAssetAdd={(asset) => {
        const placedAsset = {
          ...asset,
          id: `${asset.id}-${getHightestID(assets) + 1}` as any,
          size: { width: 20, height: 20 },
          position: { x: 590, y: 440 },
        };
        setAssets((assets) => [...assets, placedAsset]);
        addAsset(strat.id, placedAsset);
      }}
      strat={strat}
      team={team}
    >
      <StratEditorCanvas
        map={map}
        assets={assets}
        onAssetInput={(assets) => {
          setAssets((existing) =>
            existing.map((a) => {
              const newAsset = assets.find((asset) => asset.id === a.id);
              if (!newAsset) return a;
              return newAsset;
            })
          );
        }}
        onAssetChange={(assets) => {
          setAssets((existing) =>
            existing.map((a) => {
              const newAsset = assets.find((asset) => asset.id === a.id);
              if (!newAsset) return a;
              return newAsset;
            })
          );
          updateStratAssets(strat.id, assets);
        }}
        onAssetRemove={(ids) => {
          setAssets((assets) => assets.filter((a) => !ids.includes(a.id)));
          deleteStratAssets(strat.id, ids);
        }}
        renderAsset={renderAsset}
      />
      {UI}
    </StratEditorLayout>
  );
}
