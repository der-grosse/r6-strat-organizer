"use client";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/src/utils";
import { Save, Menu } from "lucide-react";
import OperatorIcon from "@/components/OperatorIcon";
import { ATTACKERS, DEFENDERS } from "@/src/static/operator";
import MAPS from "@/src/static/maps";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import Draggable from "./ui/draggable";
import Resizable from "./ui/resizable";

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
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  // only used for small screen
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const map = useMemo(
    () => MAPS.find((map) => map.name === strat.map),
    [strat.map]
  );

  const canvasRef = useRef<HTMLDivElement>(null);

  const sidebar = (
    <Tabs defaultValue="operators" className="p-4 pb-0 h-screen flex-1">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="operators">Operators</TabsTrigger>
        <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
        <TabsTrigger value="markers">Markers</TabsTrigger>
      </TabsList>
      <TabsContent value="operators" className="relative">
        <div className="h-full absolute inset-0">
          <ScrollArea className="h-full">
            <div
              className="grid grid- gap-2 items-center"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(42px, 1fr))",
              }}
            >
              <Badge className="sticky top-0 w-full col-span-full">
                Defenders
              </Badge>
              {DEFENDERS.map((op) => (
                <Button
                  variant="outline"
                  key={op.name}
                  className="p-1 h-auto"
                  onClick={() => {
                    setAssets((assets) => [
                      ...assets,
                      {
                        id: `operator-${op.name}`,
                        operator: op.name,
                        type: "operator",
                        position: { x: 0, y: 0 },
                        side: "def",
                        size: {
                          width: 100,
                          height: 100,
                        },
                      },
                    ]);
                    setSidebarOpen(false);
                  }}
                >
                  <OperatorIcon op={op} />
                </Button>
              ))}
              <Badge className="sticky top-0 w-full col-span-full">
                Attackers
              </Badge>
              {ATTACKERS.map((op) => (
                <Button
                  variant="outline"
                  key={op.name}
                  className="p-1 h-auto"
                  onClick={() => {
                    setAssets((assets) => [
                      ...assets,
                      {
                        id: `operator-${op.name}`,
                        operator: op.name,
                        type: "operator",
                        position: { x: 0, y: 0 },
                        side: "def",
                        size: {
                          width: 100,
                          height: 100,
                        },
                      },
                    ]);
                    setSidebarOpen(false);
                  }}
                >
                  <OperatorIcon op={op} />
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>
      <TabsContent value="gadgets" className="mt-4">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-2 gap-2"></div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="markers" className="mt-4">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-2 gap-2"></div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="h-screen w-screen overflow-hidden xl:grid xl:grid-cols-[1fr_4fr]">
      {/* small screen sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden absolute top-2 left-2 z-10"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0" hideClose>
          <SheetTitle className="sr-only">Toolbar</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>

      {/* large screen sidebar */}
      <div className="hidden xl:flex flex-row">
        {sidebar}
        <Separator orientation="vertical" className="mx-2 hidden xl:block" />
      </div>

      {/* Canvas */}
      <div className="flex-1 relative h-screen overflow-hidden py-0 block">
        <div className="relative h-full w-full flex items-center justify-center">
          <div
            className="relative overflow-hidden"
            ref={canvasRef}
            style={{
              aspectRatio: map && map.floors.length > 2 ? "4/3" : "8/3",
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
            }}
          >
            {map?.floors.map((floor) => (
              <img
                key={floor.floor}
                src={floor.src}
                alt={floor.floor}
                className={cn(
                  "object-contain inline w-1/2",
                  map && map.floors.length > 2 && "h-1/2"
                )}
              />
            ))}
            {assets.map((asset) => (
              <Draggable
                key={asset.id}
                id={asset.id}
                boundingRef={canvasRef}
                position={asset.position}
                onPositionChange={(pos) => {
                  setAssets(
                    assets.map((a) =>
                      a.id === asset.id ? { ...a, position: pos } : a
                    )
                  );
                }}
              >
                <Resizable
                  id={asset.id}
                  size={asset.size}
                  onSizeChange={(size) => {
                    setAssets(
                      assets.map((a) =>
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
        </div>
      </div>

      {/* Save Button */}
      <Button
        className="absolute top-4 right-4"
        size="icon"
        onClick={() => {
          alert("Not implemented");
        }}
      >
        <Save />
      </Button>
    </div>
  );
}
