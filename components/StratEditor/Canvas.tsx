"use client";
import { useRef } from "react";
import OperatorIcon from "../OperatorIcon";
import Draggable from "../ui/draggable";
import Resizable from "../ui/resizable";
import { cn } from "@/src/utils";

export default function StratEditorCanvas(
  props: Readonly<{
    map: R6Map | null;
    assets: PlacedAsset[];
    onAssetChange: (assets: PlacedAsset[]) => void;
  }>
) {
  const canvasRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="relative overflow-hidden"
      ref={canvasRef}
      style={{
        aspectRatio: props.map && props.map.floors.length > 2 ? "4/3" : "8/3",
        maxWidth: "100%",
        maxHeight: "100%",
        width: "auto",
        height: "auto",
      }}
    >
      {props.map?.floors.map((floor) => (
        <img
          key={floor.floor}
          src={floor.src}
          alt={floor.floor}
          className={cn(
            "object-contain inline w-1/2",
            props.map && props.map.floors.length > 2 && "h-1/2"
          )}
        />
      ))}
      {props.assets.map((asset) => (
        <Draggable
          key={asset.id}
          id={asset.id}
          boundingRef={canvasRef}
          position={asset.position}
          onPositionChange={(pos) => {
            props.onAssetChange(
              props.assets.map((a) =>
                a.id === asset.id ? { ...a, position: pos } : a
              )
            );
          }}
        >
          <Resizable
            id={asset.id}
            size={asset.size}
            onSizeChange={(size) => {
              props.onAssetChange(
                props.assets.map((a) =>
                  a.id === asset.id ? { ...a, size } : a
                )
              );
            }}
            boundingRef={canvasRef}
          >
            {asset.type === "operator" && (
              <div className="flex cursor-move items-center gap-2 rounded-md border bg-background hover:bg-accent">
                <OperatorIcon op={asset.operator} />
              </div>
            )}
          </Resizable>
        </Draggable>
      ))}
    </div>
  );
}
