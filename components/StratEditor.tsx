"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilter } from "@/components/context/FilterContext";
import { cn } from "@/src/utils";
import { MapPin, Shield, User, X } from "lucide-react";
import OperatorIcon from "@/components/OperatorIcon";
import DEFENDERS from "@/data/operator";
import ATTACKERS from "@/data/operator";
import { toast } from "sonner";

interface Position {
  x: number;
  y: number;
}

interface Asset {
  id: string;
  type: "operator" | "gadget" | "marker";
  name: string;
  position: Position;
  rotation: number;
}

interface StratEditorProps {
  map: string;
  site: string;
  drawingID?: string;
  onSave?: (assets: Asset[]) => void;
}

export function StratEditor({
  map,
  site,
  drawingID,
  onSave,
}: StratEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [moveStart, setMoveStart] = useState<Position | null>(null);

  // Load map image
  useEffect(() => {
    // Load map image based on map name
    setMapImage(`/maps/${map.toLowerCase()}.jpg`);
  }, [map]);

  // Add keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedAsset && (e.key === "Delete" || e.key === "Backspace")) {
        handleAssetDelete(selectedAsset.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAsset]);

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.dataTransfer.setData("text/plain", JSON.stringify(asset));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!canvasRef.current || !dragStart) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const asset = JSON.parse(e.dataTransfer.getData("text/plain"));
    const newAsset: Asset = {
      ...asset,
      id: `${asset.type}-${Date.now()}`,
      position: { x, y },
    };

    setAssets((prev) => [...prev, newAsset]);
  };

  const handleAssetMouseDown = (e: React.MouseEvent, asset: Asset) => {
    if (e.button !== 0) return; // Only handle left click
    e.preventDefault();
    setIsMoving(true);
    setSelectedAsset(asset);
    setMoveStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isMoving || !selectedAsset || !moveStart || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = e.clientX - moveStart.x;
    const deltaY = e.clientY - moveStart.y;

    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === selectedAsset.id) {
          return {
            ...asset,
            position: {
              x: asset.position.x + deltaX,
              y: asset.position.y + deltaY,
            },
          };
        }
        return asset;
      })
    );

    setMoveStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseUp = () => {
    setIsMoving(false);
    setMoveStart(null);
  };

  const handleAssetClick = (asset: Asset) => {
    if (!isMoving) {
      setSelectedAsset(asset);
    }
  };

  const handleAssetDelete = (assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    setSelectedAsset(null);
  };

  const handleAssetRotate = (assetId: string, direction: "left" | "right") => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === assetId) {
          const rotation = direction === "left" ? -90 : 90;
          return {
            ...asset,
            rotation: (asset.rotation + rotation) % 360,
          };
        }
        return asset;
      })
    );
  };

  const handleSave = () => {
    if (onSave) {
      onSave(assets);
      toast.success("Strat saved successfully");
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Toolbar */}
      <Card className="w-64 p-4">
        <Tabs defaultValue="operators">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
            <TabsTrigger value="markers">Markers</TabsTrigger>
          </TabsList>
          <TabsContent value="operators" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Defenders</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {DEFENDERS.map((op) => (
                      <div
                        key={op.name}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, {
                            id: "",
                            type: "operator",
                            name: op.name,
                            position: { x: 0, y: 0 },
                            rotation: 0,
                          })
                        }
                        className="flex cursor-move items-center gap-2 rounded-md border p-2 hover:bg-accent"
                      >
                        <OperatorIcon op={op} />
                        <span className="text-sm">{op.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 text-sm font-medium">Attackers</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ATTACKERS.map((op) => (
                      <div
                        key={op.name}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, {
                            id: "",
                            type: "operator",
                            name: op.name,
                            position: { x: 0, y: 0 },
                            rotation: 0,
                          })
                        }
                        className="flex cursor-move items-center gap-2 rounded-md border p-2 hover:bg-accent"
                      >
                        <OperatorIcon op={op} />
                        <span className="text-sm">{op.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="gadgets" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-2 gap-2">
                {/* Add gadget items here */}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="markers" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-2 gap-2">
                {/* Add marker items here */}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Canvas */}
      <div className="flex-1">
        <Card className="relative h-[calc(100vh-100px)] overflow-hidden">
          <div
            ref={canvasRef}
            className="relative h-full w-full"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {mapImage && (
              <img
                src={mapImage}
                alt={map}
                className="h-full w-full object-contain"
              />
            )}
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={cn(
                  "absolute cursor-move select-none",
                  selectedAsset?.id === asset.id && "ring-2 ring-primary"
                )}
                style={{
                  left: asset.position.x,
                  top: asset.position.y,
                  transform: `rotate(${asset.rotation}deg)`,
                }}
                onClick={() => handleAssetClick(asset)}
                onMouseDown={(e) => handleAssetMouseDown(e, asset)}
              >
                {asset.type === "operator" && (
                  <OperatorIcon
                    op={
                      [...DEFENDERS, ...ATTACKERS].find(
                        (op) => op.name === asset.name
                      )!
                    }
                  />
                )}
                {asset.type === "gadget" && <Shield className="h-8 w-8" />}
                {asset.type === "marker" && <MapPin className="h-8 w-8" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Asset Controls */}
      {selectedAsset && (
        <Card className="w-64 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Asset Controls</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAssetDelete(selectedAsset.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAssetRotate(selectedAsset.id, "left")}
              >
                ↶
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAssetRotate(selectedAsset.id, "right")}
              >
                ↷
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Save Button */}
      <Button className="absolute bottom-4 right-4" onClick={handleSave}>
        Save Strat
      </Button>
    </div>
  );
}
