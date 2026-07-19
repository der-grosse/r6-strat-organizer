import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Adaptation, Strat } from "@/lib/types/strat.types";
import { PlacedAsset } from "@/lib/types/asset.types";
import { useMutation } from "convex/react";
import { ChevronDown, EyeOff, Layers, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import DndList from "@/components/general/DndList";
import useDebounced from "@/components/hooks/useDebounced";
import AdaptationFilter, { DEFAULT_ADAPTATION_FILTER } from "./AdaptationFilter";

export interface AdaptationsSidebarProps {
  strat: Strat;
  allAssets: PlacedAsset[];
  activeAdaptationID: Id<"adaptations"> | null;
  onActiveAdaptationChange: (id: Id<"adaptations"> | null) => void;
}

export default function AdaptationsSidebar({
  strat,
  allAssets,
  activeAdaptationID,
  onActiveAdaptationChange,
}: AdaptationsSidebarProps) {
  const createAdaptation = useMutation(api.strats.createAdaptation);
  const reorderAdaptations = useMutation(api.strats.reorderAdaptations);

  const adaptations = [...strat.adaptations].sort((a, b) => a.index - b.index);

  return (
    <ScrollArea className="h-screen">
      <div className="p-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Layers className="text-muted-foreground" />
          <Label className="text-muted-foreground">Adaptations</Label>
        </div>
        <p className="text-xs text-muted-foreground px-1">
          Adaptations are prioritized variations of this strat. Add filters to control when an
          adaptation activates, then edit it to hide base assets and place assets shown only for it.
          Drag to reorder priority.
        </p>
        <p className="text-xs text-foreground px-1">
          <strong>This is an advanced feature, only recommended for power users!</strong>
        </p>

        {adaptations.length === 0 && (
          <p className="text-sm text-muted-foreground p-1">
            <em>No adaptations yet.</em>
          </p>
        )}

        <DndList
          items={adaptations.map((a) => ({ ...a, id: a._id }))}
          onChange={(items) => {
            reorderAdaptations({
              stratID: strat._id,
              orderedAdaptationIDs: items.map((item) => item.id),
            });
          }}
          slots={{ handle: { className: "shrink-0" } }}
        >
          {(item, dragProps, handle) => (
            <div ref={dragProps.ref} style={dragProps.style} className="mb-2">
              <AdaptationItem
                adaptation={item}
                assetCount={allAssets.filter((asset) => asset.adaptationID === item._id).length}
                isActive={activeAdaptationID === item._id}
                onOpenChange={(open) => onActiveAdaptationChange(open ? item._id : null)}
                handle={handle}
              />
            </div>
          )}
        </DndList>

        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            const result = await createAdaptation({ stratID: strat._id });
            if (result?.success && result.adaptationID) {
              onActiveAdaptationChange(result.adaptationID);
            }
          }}
        >
          <Plus className="mr-2" />
          Add Adaptation
        </Button>
      </div>
    </ScrollArea>
  );
}

function AdaptationItem({
  adaptation,
  assetCount,
  isActive,
  onOpenChange,
  handle,
}: {
  adaptation: Adaptation;
  assetCount: number;
  isActive: boolean;
  onOpenChange: (open: boolean) => void;
  handle: React.ReactNode;
}) {
  const updateAdaptation = useMutation(api.strats.updateAdaptation);
  const deleteAdaptation = useMutation(api.strats.deleteAdaptation);

  const [name, setName] = useState(adaptation.name);
  useEffect(() => setName(adaptation.name), [adaptation.name]);
  useDebounced(name, {
    onChange(value) {
      if (value !== adaptation.name) {
        updateAdaptation({ adaptationID: adaptation._id, name: value });
      }
    },
  });

  const updateFilters = (filters: Adaptation["filters"]) =>
    updateAdaptation({ adaptationID: adaptation._id, filters });

  return (
    <Collapsible
      open={isActive}
      onOpenChange={onOpenChange}
      className={cn(
        "rounded-md border bg-muted/50 py-1",
        isActive && "border-primary ring-1 ring-primary",
      )}
    >
      <div className="flex items-center gap-1 px-1">
        {handle}
        {isActive ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adaptation name"
            className="h-8 flex-1 bg-transparent border-none shadow-none focus-visible:ring-1 px-1"
          />
        ) : (
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="h-8 flex-1 truncate px-1 text-left text-sm cursor-pointer"
            >
              {name || <span className="text-muted-foreground">Unnamed adaptation</span>}
            </button>
          </CollapsibleTrigger>
        )}
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="group h-8 w-8 shrink-0">
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>
      </div>

      <div className="flex items-center gap-3 px-2 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Plus className="h-3 w-3" />
          {assetCount} asset{assetCount === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1">
          <EyeOff className="h-3 w-3" />
          {adaptation.hiddenAssetIDs.length} hidden
        </span>
      </div>

      <CollapsibleContent className="space-y-2 px-2 pt-2">
        <Separator orientation="horizontal" />
        <Label className="text-muted-foreground text-xs">Activation filters</Label>
        {adaptation.filters.map((filter, index) => (
          <AdaptationFilter
            key={index}
            index={index}
            filter={filter}
            onChange={(updated) =>
              updateFilters(adaptation.filters.map((f, i) => (i === index ? updated : f)))
            }
            onRemove={() => updateFilters(adaptation.filters.filter((_, i) => i !== index))}
          />
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => updateFilters([...adaptation.filters, { ...DEFAULT_ADAPTATION_FILTER }])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Filter
        </Button>
        <Separator orientation="horizontal" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:text-destructive"
          onClick={() => deleteAdaptation({ adaptationID: adaptation._id })}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete adaptation
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
