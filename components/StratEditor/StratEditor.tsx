"use client";
import { useMemo, useState } from "react";
import MAPS from "@/src/static/maps";
import StratEditorLayout from "./Layout";
import StratEditorCanvas from "./Canvas";

interface StratEditorProps {
  strat: StratDrawing;
}

export function StratEditor({ strat }: Readonly<StratEditorProps>) {
  const [assets, setAssets] = useState<PlacedAsset[]>([
    {
      id: "operator-smoke",
      operator: "Smoke",
      type: "operator",
      position: { x: 0, y: 0 },
      side: "def",
      size: {
        width: 100,
        height: 100,
      },
    },
  ]);

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
            size: { width: 100, height: 100 },
            position: { x: 0, y: 0 },
          },
        ])
      }
    >
      <StratEditorCanvas map={map} assets={assets} onAssetChange={setAssets} />
    </StratEditorLayout>
  );
}
