"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/src/utils";
import { MapPin, Shield, User, X } from "lucide-react";
import OperatorIcon from "@/components/OperatorIcon";
import DEFENDERS from "@/src/static/operator";
import ATTACKERS from "@/src/static/operator";
import MAPS from "@/src/static/maps";

interface StratEditorProps {
  strat: StratDrawing;
}

export function StratEditor({ strat }: StratEditorProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const map = useMemo(
    () => MAPS.find((map) => map.name === strat.map),
    [strat.map]
  );

  return (
    <div>
      {/* Toolbar */}
      {/* <Card className="w-64 p-2">
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
              <div className="grid grid-cols-2 gap-2"></div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="markers" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-2 gap-2"></div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card> */}

      {/* Canvas */}
      <div
        className="relative overflow-hidden"
        style={
          map && map.floors.length > 2
            ? {
                aspectRatio: "4/3",
                height: "calc(100dvh - 12 * var(--spacing))",
                width: "auto",
              }
            : {
                aspectRatio: "8/3",
                width: "100%",
                height: "auto",
              }
        }
      >
        {map?.floors.map((floor) => (
          <img
            key={floor.floor}
            src={floor.src}
            alt={floor.floor}
            className="object-contain inline w-1/2 h-1/2"
          />
        ))}
      </div>

      {/* Save Button */}
      {/* <Button
        className="absolute bottom-4 right-4"
        onClick={() => {
          alert("Not implemented");
        }}
      >
        Save Strat
      </Button> */}
    </div>
  );
}
