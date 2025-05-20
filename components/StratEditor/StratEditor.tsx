"use client";
import { useMemo, useState } from "react";
import MAPS from "@/src/static/maps";
import StratEditorLayout from "./Layout";
import StratEditorCanvas from "./Canvas";
import useMountAssets from "./Assets";

interface StratEditorProps {
  strat: StratDrawing;
}

export function StratEditor({ strat }: Readonly<StratEditorProps>) {
  const [assets, setAssets] = useState<PlacedAsset[]>([
    {
      id: "operator-smoke",
      operator: "Smoke",
      type: "operator",
      player: 1,
      position: { x: 450, y: 200 },
      side: "def",
      showIcon: true,
      size: {
        width: 25,
        height: 25,
      },
    },
    {
      id: "operator-frost",
      operator: "Frost",
      type: "operator",
      player: 1,
      position: { x: 100, y: 600 },
      side: "def",
      showIcon: true,
      size: {
        width: 25,
        height: 25,
      },
    },
  ]);

  const { renderAsset, UI } = useMountAssets({
    deleteAsset(asset) {
      setAssets((assets) => assets.filter((a) => a.id !== asset.id));
    },
    updateAsset(asset) {
      setAssets((assets) => assets.map((a) => (a.id === asset.id ? asset : a)));
    },
  });

  const map = useMemo(
    () => MAPS.find((map) => map.name === strat.map) ?? null,
    [strat.map]
  );

  return (
    <StratEditorLayout
      onAssetAdd={(asset) =>
        setAssets((assets) => [
          ...assets,
          {
            ...asset,
            size: { width: 25, height: 25 },
            position: { x: 0, y: 0 },
          },
        ])
      }
    >
      <StratEditorCanvas
        map={map}
        assets={assets}
        onAssetChange={setAssets}
        renderAsset={renderAsset}
      />
      {UI}
    </StratEditorLayout>
  );
}
