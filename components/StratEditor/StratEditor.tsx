"use client";
import { useMemo, useState } from "react";
import MAPS from "@/src/static/maps";
import StratEditorLayout from "./Layout";
import StratEditorCanvas from "./Canvas";
import OperatorIcon from "../OperatorIcon";
import { cn } from "@/src/utils";

interface StratEditorProps {
  strat: StratDrawing;
}

export function StratEditor({ strat }: Readonly<StratEditorProps>) {
  const [assets, setAssets] = useState<PlacedAsset[]>([
    {
      id: "operator-smoke",
      operator: "Smoke",
      type: "operator",
      player: "test",
      position: { x: 450, y: 200 },
      side: "def",
      size: {
        width: 100,
        height: 100,
      },
    },
    {
      id: "operator-frost",
      operator: "Frost",
      type: "operator",
      player: "test2",
      position: { x: 100, y: 600 },
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
              <div className="w-[130%] h-[130%] m-[-15%] relative">
                <OperatorIcon
                  op={asset.operator}
                  className="w-full h-full absolute z-10"
                />
                <div
                  className={cn(
                    "m-[12.5%] w-[75%] h-[75%] absolute top-0 left-0 z-0",
                    asset.player && !asset.customColor && "bg-blue-500"
                  )}
                  style={{
                    background: asset.customColor,
                  }}
                />
              </div>
            );
          return "Missing";
        }}
      />
    </StratEditorLayout>
  );
}
