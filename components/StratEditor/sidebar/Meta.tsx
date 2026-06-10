import useDebounced from "@/components/hooks/useDebounced";
import MapSelector from "@/components/general/MapSelector";
import SiteSelector from "@/components/general/SiteSelector";
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
import {
  Download,
  FolderPen,
  Funnel,
  Link,
  Map,
  MapPinned,
  Settings2,
  Trash,
  Unlink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { extractDrawingID } from "@/lib/googleDrawings";
import { Strat } from "@/lib/types/strat.types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import MAPS from "@/lib/static/maps";
import OperatorFilter from "./OperatorFilter";
import SidebarLabeledToggle from "@/components/ui/sidebarLabeledToggle";
import { FullTeam } from "@/lib/types/team.types";
import { useStratExport } from "../ExportRenderer";

export interface StratEditorMetaSidebarProps {
  strat: Strat;
  team: FullTeam;
}

export default function StratEditorMetaSidebar(props: StratEditorMetaSidebarProps) {
  const updateStrat = useMutation(api.strats.update);
  const archiveStrat = useMutation(api.strats.archive);
  const router = useRouter();
  const { exporting, exportStratAsPNG } = useStratExport();

  const usesInternalEditor = !props.strat.drawingID;

  const [name, setName] = useState(props.strat.name);
  const [description, setDescription] = useState(props.strat.description);
  const [showFloorNames, setShowFloorNames] = useState(props.strat.showFloorNames ?? true);
  const [hiddenFloors, setHiddenFloors] = useState(props.strat.hiddenFloors || []);

  // update local state when strat prop changes
  useEffect(() => {
    setHiddenFloors(props.strat.hiddenFloors || []);
    setName(props.strat.name);
    setDescription(props.strat.description);
    setShowFloorNames(props.strat.showFloorNames ?? true);
  }, [props.strat]);

  // debounced updates
  useDebounced(name, {
    onChange(name) {
      updateStrat({ _id: props.strat._id, name });
    },
  });
  useDebounced(description, {
    onChange(description) {
      updateStrat({ _id: props.strat._id, description });
    },
  });

  // show floor names logic
  const toggleShowFloorNames = (show: boolean) => {
    setShowFloorNames(show);
    updateStrat({ _id: props.strat._id, showFloorNames: show });
  };

  // hidden floors logic
  const selectedMapFloors = MAPS.find((map) => map.name === props.strat.map)?.floors ?? [];

  const toggleHiddenFloor = (floorIndex: number, shouldHide: boolean) => {
    const nextHidden = shouldHide
      ? Array.from(new Set([...hiddenFloors, floorIndex])).sort((a, b) => a - b)
      : hiddenFloors.filter((index) => index !== floorIndex);

    // Ensure at least one floor remains visible
    if (nextHidden.length === selectedMapFloors.length) return;

    setHiddenFloors(nextHidden);
    updateStrat({ _id: props.strat._id, hiddenFloors: nextHidden });
  };

  // dialog states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmGoogleDrawingOpen, setConfirmGoogleDrawingOpen] = useState(false);
  const [newDrawingID, setNewDrawingID] = useState("");

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
              setHiddenFloors([]);
              updateStrat({
                _id: props.strat._id,
                map: map.name,
                site: map?.sites[0],
                hiddenFloors: [],
              });
            }}
            trigger={({ children, ...props }) => (
              <Button {...props} variant="outline">
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
              updateStrat({ _id: props.strat._id, site });
            }}
            trigger={({ children, ...props }) => (
              <Button {...props} variant="outline">
                {children}
              </Button>
            )}
          />

          <Separator />
          <div className="flex items-center gap-2">
            <FolderPen className="text-muted-foreground" />
            <Label className="text-muted-foreground">Name</Label>
          </div>
          <Input placeholder="Strat Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="max-h-40"
          />

          <Separator />
          <div className="flex items-center gap-2">
            <Map className="text-muted-foreground" />
            <Label className="text-muted-foreground">
              Map Settings
              {props.strat.drawingID && (
                <span className="-ml-1 text-xs font-normal text-muted-foreground opacity-75">
                  (disabled for external editor)
                </span>
              )}
            </Label>
          </div>

          {/* show floor names */}
          <SidebarLabeledToggle
            className="rounded-md border bg-muted/50 p-1"
            label="Show Floor Names"
            labels={["Yes", "No"]}
            active={showFloorNames}
            onChange={toggleShowFloorNames}
            disabled={!usesInternalEditor}
          />

          <Separator />
          <div className="flex items-center gap-2">
            <Funnel className="text-muted-foreground" />
            <Label className="text-muted-foreground">Filters</Label>
          </div>
          <OperatorFilter
            type="attackers"
            filter={props.strat.filters?.attackers}
            onChange={(attackers) => {
              updateStrat({
                _id: props.strat._id,
                filters: { ...props.strat.filters, attackers },
              });
            }}
          />
          <OperatorFilter
            type="defenders"
            filter={props.strat.filters?.defenders}
            onChange={(defenders) => {
              updateStrat({
                _id: props.strat._id,
                filters: { ...props.strat.filters, defenders },
              });
            }}
          />

          <Separator />
          <div className="flex items-center gap-2">
            <Settings2 className="text-muted-foreground" />
            <Label className="text-muted-foreground">Actions</Label>
          </div>

          <Button
            variant="outline"
            className="w-full"
            disabled={exporting}
            onClick={() => exportStratAsPNG(props.strat, props.team)}
          >
            <Download className="mr-2" />
            {exporting ? "Exporting..." : "Export as Image"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setConfirmGoogleDrawingOpen(true)}
          >
            {props.strat.drawingID ? (
              <>
                <Unlink className="mr-2" />
                Unlink Google Drawing
              </>
            ) : (
              <>
                <Link className="mr-2" />
                Link Google Drawing
              </>
            )}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setConfirmDeleteOpen(true)}>
            <Trash className="mr-2" />
            Delete Strat
          </Button>
        </div>
      </ScrollArea>

      <Dialog open={confirmGoogleDrawingOpen} onOpenChange={setConfirmGoogleDrawingOpen}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>
              {props.strat.drawingID ? "Unlink Google Drawing" : "Link Google Drawing"}
            </DialogTitle>
            <DialogDescription>
              {props.strat.drawingID
                ? "Are you sure you want to unlink this Google Drawing?"
                : "Please enter the Google Drawing link to link it to this strat."}
            </DialogDescription>
          </DialogHeader>
          {!props.strat.drawingID && (
            <Input
              placeholder="Google Drawing Link"
              value={newDrawingID}
              onChange={(e) => {
                const url = e.target.value;
                setNewDrawingID(url);
              }}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmGoogleDrawingOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const newParsedID = props.strat.drawingID ? null : extractDrawingID(newDrawingID);

                updateStrat({
                  _id: props.strat._id,
                  drawingID: newParsedID,
                }).then(() => {
                  setNewDrawingID("");
                  setConfirmGoogleDrawingOpen(false);
                });
              }}
            >
              {props.strat.drawingID ? "Unlink" : "Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>Delete Strat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this strat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                archiveStrat({ stratID: props.strat._id }).then(() => {
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
