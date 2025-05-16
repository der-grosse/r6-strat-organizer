"use client";
import { useMemo, useState } from "react";
import MAPS from "@/src/static/maps";
import StratEditorLayout from "./Layout";
import StratEditorCanvas from "./Canvas";
import OperatorIcon from "../OperatorIcon";

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
      <StratEditorCanvas
        map={map}
        assets={assets}
        onAssetChange={setAssets}
        renderAsset={(asset) => {
          if (asset.type === "operator")
            return (
              <OperatorIcon
                op={asset.operator}
                className="w-[130%] h-[130%] m-[-15%] max-w-[130%]"
              />
            );
          return "Missing";
        }}
      />
    </StratEditorLayout>
  );
}
