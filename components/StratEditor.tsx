"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/src/utils";
import { MapPin, Save, Shield, User, X } from "lucide-react";
import OperatorIcon from "@/components/OperatorIcon";
import DEFENDERS from "@/src/static/operator";
import ATTACKERS from "@/src/static/operator";
import MAPS from "@/src/static/maps";
import { Badge } from "./ui/badge";

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
    <div className="h-screen w-screen overflow-hidden grid grid-cols-[1fr_4fr]">
      {/* Toolbar */}
      <div className="flex flex-row">
        <Tabs defaultValue="operators" className="p-4 pb-0 h-screen flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
            <TabsTrigger value="markers">Markers</TabsTrigger>
          </TabsList>
          <TabsContent value="operators" className="relative">
            <div className="h-full absolute inset-0">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Badge className="sticky top-0 w-full col-span-2">
                    Defenders
                  </Badge>
                  {DEFENDERS.map((op) => (
                    <div
                      key={op.name}
                      className="flex cursor-move items-center gap-2 rounded-md border p-2 hover:bg-accent"
                    >
                      <OperatorIcon op={op} />
                      <span className="text-sm">{op.name}</span>
                    </div>
                  ))}
                  <Badge className="sticky top-0 w-full col-span-2">
                    Attackers
                  </Badge>
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
        <Separator orientation="vertical" className="mx-2" />
      </div>

      {/* Canvas */}
      <div
        className="relative overflow-hidden self-center"
        style={
          map && map.floors.length > 2
            ? {
                aspectRatio: "4/3",
                height: "100dvh",
                width: "auto",
              }
            : {
                aspectRatio: "8/3",
                width: "80vw",
                height: "auto",
              }
        }
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
