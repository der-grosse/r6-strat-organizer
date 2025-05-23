import useDebounced from "@/components/hooks/useDebounced";
import Reinforcement from "@/components/icons/reinforcement";
import MapSelector from "@/components/MapSelector";
import SiteSelector from "@/components/SiteSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { updateStrat } from "@/src/strats/strats";
import { FolderPen, MapPinned } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface StratEditorMetaSidebarProps {
  strat: Strat;
}

export default function StratEditorMetaSidebar(
  props: StratEditorMetaSidebarProps
) {
  const [name, setName] = useState(props.strat.name);
  const [description, setDescription] = useState(props.strat.description);

  useDebounced(name, {
    onChange(name) {
      if (name === props.strat.name) return;
      updateStrat({ id: props.strat.id, name });
    },
  });
  useDebounced(description, {
    onChange(description) {
      if (description === props.strat.description) return;
      updateStrat({ id: props.strat.id, description });
    },
  });

  return (
    <ScrollArea className="h-screen">
      <div className="p-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <MapPinned className="text-muted-foreground" />
          <Label className="text-muted-foreground">Map + Site</Label>
        </div>
        <MapSelector
          hideEmpty
          map={props.strat.map}
          onChange={(map) => {
            if (!map) return;
            updateStrat({
              id: props.strat.id,
              map: map.name,
              site: map?.sites[0],
            });
          }}
          trigger={({ children, ...props }) => (
            <Button {...props} variant="ghost">
              {children}
            </Button>
          )}
        />
        <SiteSelector
          hideEmpty
          map={props.strat.map}
          site={props.strat.site}
          onChange={(site) => {
            if (!site) return;
            updateStrat({ id: props.strat.id, site });
          }}
          trigger={({ children, ...props }) => (
            <Button {...props} variant="ghost">
              {children}
            </Button>
          )}
        />
        <Separator />
        <div className="flex items-center gap-2">
          <FolderPen className="text-muted-foreground" />
          <Label className="text-muted-foreground">Name</Label>
        </div>
        <Input
          placeholder="Strat Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </ScrollArea>
  );
}
