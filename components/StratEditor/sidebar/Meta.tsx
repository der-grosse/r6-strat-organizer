import useDebounced from "@/components/hooks/useDebounced";
import MapSelector from "@/components/MapSelector";
import SiteSelector from "@/components/SiteSelector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { archiveStrat, updateStrat } from "@/src/strats/strats";
import {
  FolderPen,
  MapPinned,
  RefreshCw,
  Settings2,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface StratEditorMetaSidebarProps {
  strat: Strat;
}

export default function StratEditorMetaSidebar(
  props: StratEditorMetaSidebarProps
) {
  const router = useRouter();
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

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  return (
    <>
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
          <Separator />
          <div className="flex items-center gap-2">
            <RefreshCw className="text-muted-foreground" />
            <Label className="text-muted-foreground">Rotation Indexes</Label>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Button
                key={i}
                variant={
                  props.strat.rotationIndex?.includes(i + 1)
                    ? "outline"
                    : "ghost"
                }
                size="icon"
                onClick={() => {
                  updateStrat({
                    id: props.strat.id,
                    rotationIndex: props.strat.rotationIndex?.includes(i + 1)
                      ? props.strat.rotationIndex?.filter((x) => x !== i + 1)
                      : [...(props.strat.rotationIndex || []), i + 1].sort(),
                  });
                }}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <Settings2 className="text-muted-foreground" />
            <Label className="text-muted-foreground">Actions</Label>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash className="mr-2" />
            Delete Strat
          </Button>
        </div>
      </ScrollArea>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>Delete Strat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this strat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                archiveStrat(props.strat.id).then(() => {
                  router.push("/");
                })
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
