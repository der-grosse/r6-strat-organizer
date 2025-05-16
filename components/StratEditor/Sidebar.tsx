"use client";
import { ATTACKERS, DEFENDERS } from "@/src/static/operator";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import OperatorIcon from "../OperatorIcon";

export interface StratEditorSidebarProps {
  onAssetAdd: (asset: Asset) => void;
}

export default function StratEditorSidebar(
  props: Readonly<StratEditorSidebarProps>
) {
  return (
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
                    props.onAssetAdd({
                      id: `operator-${op.name}`,
                      operator: op.name,
                      type: "operator",
                      side: "def",
                    });
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
                    props.onAssetAdd({
                      id: `operator-${op.name}`,
                      operator: op.name,
                      type: "operator",
                      side: "def",
                    });
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
}
