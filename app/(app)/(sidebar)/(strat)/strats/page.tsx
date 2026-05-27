"use client";
import { useFilter } from "@/components/context/FilterContext";
import OperatorIcon from "@/components/general/OperatorIcon";
import { Button } from "@/components/ui/button";
import { DEFENDERS } from "@/lib/static/operator";
import {
  Copy,
  Download,
  Eye,
  GripVertical,
  Info,
  MoreHorizontal,
  Pencil,
  Slash,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreateStratDialog } from "./CreateStratDialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { DeleteStratDialog } from "./DeleteStratDialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { FullTeam } from "@/lib/types/team.types";
import { Strat } from "@/lib/types/strat.types";
import { Id } from "@/convex/_generated/dataModel";
import { usePlayableStrats } from "@/lib/strats";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStratExport } from "@/components/StratEditor/ExportRenderer";
import { PromiseButton } from "@/components/ui/promise-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TABLE_SIZES = {
  handle: "5%",
  map: "10%",
  site: "15%",
  name: "30%",
  ops: "20%",
  filters: "15%",
  actions: "5%",
};

export default function AllStratsPage() {
  const team = useQuery(api.team.get);
  const { filter } = useFilter();
  const bannedOps = useQuery(api.bannedOps.get);
  const strats = usePlayableStrats(filter, bannedOps);
  const [mapDragging, setMapDragging] = useState<string | null>(null);

  const stratsByMap = useMemo(() => {
    if (!strats) return [];
    return Object.entries(
      strats.reduce(
        (acc, strat) => {
          if (!acc[strat.strat.map]) {
            acc[strat.strat.map] = [];
          }
          acc[strat.strat.map].push(strat);
          return acc;
        },
        {} as Record<string, typeof strats>,
      ),
    );
  }, [strats]);

  return (
    <div className="w-full h-full p-4 flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-1 items-center">
        <div />
        <p className="text-center text-muted-foreground leading-none">
          All Strats
          <Tooltip>
            <TooltipTrigger className="align-baseline ml-1">
              <Info className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              <b>Shortcuts</b>
              <ul className="list-disc ml-4">
                <li>Edit a strat by double clicking</li>
                <li>Edit strat name by double clicking the name</li>
              </ul>
            </TooltipContent>
          </Tooltip>
          <br />
          <span className="text-xs leading-none">
            (total {strats?.length ?? 0})
          </span>
        </p>
        <div className="flex justify-end">
          <CreateStratDialog />
        </div>
      </div>
      <div
        className="mb-2 flex flex-col"
        style={{ gridTemplateColumns: "auto auto auto auto auto auto" }}
      >
        {/* mb-2 needed to prevent overflow of table component due to -my-2 used in table cells */}
        <div className="w-full flex py-2 border-b border-border border-collapse">
          <div style={{ width: TABLE_SIZES.handle }}></div>
          <div className="font-bold" style={{ width: TABLE_SIZES.map }}>
            Map
          </div>
          <div className="font-bold" style={{ width: TABLE_SIZES.site }}>
            Site
          </div>
          <div className="font-bold" style={{ width: TABLE_SIZES.name }}>
            Name
          </div>
          <div
            className="font-bold"
            style={{ width: TABLE_SIZES.filters }}
          ></div>
          <div className="font-bold pl-1" style={{ width: TABLE_SIZES.ops }}>
            Operators
          </div>
          <div
            className="font-bold pl-2"
            style={{ width: TABLE_SIZES.actions }}
          ></div>
        </div>
        {!strats || !team ? (
          <Skeleton className="col-span-full h-8 mb-2" amount={12} />
        ) : (
          stratsByMap.flatMap(([map, strats]) => (
            <MapStrats
              key={map}
              team={team}
              strats={strats}
              onDragChange={(dragging) => setMapDragging(dragging ? map : null)}
              disabled={mapDragging !== null && mapDragging !== map}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MapStrats({
  strats,
  team,
  onDragChange,
  disabled,
}: {
  strats: { strat: Strat; playable: boolean }[];
  team: FullTeam;
  onDragChange: (dragging: boolean) => void;
  disabled: boolean;
}) {
  const { filter } = useFilter();
  const updateStratIndex = useMutation(api.strats.updateIndex);
  const [optimisticStrats, setOptimisticStrats] = useState(strats);
  useEffect(() => {
    setOptimisticStrats(strats);
  }, [strats]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    onDragChange(false);

    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = optimisticStrats.findIndex(
        (item) => item.strat._id === active.id,
      );
      const newIndex = optimisticStrats.findIndex(
        (item) => item.strat._id === over?.id,
      );

      // Optimistically update the UI
      const newStrats = arrayMove(optimisticStrats, oldIndex, newIndex);
      setOptimisticStrats(
        newStrats.map((strat, i) => ({
          ...strat,
          mapIndex: i,
        })),
      );

      try {
        const res = await updateStratIndex({
          stratID: active.id as Id<"strats">,
          newIndex,
          orderedStratIDs: newStrats.map((strat) => strat.strat._id),
        });
        if (!res.success) {
          throw new Error(res.error);
        }
      } catch (error) {
        console.error("Error updating member positions:", error);
        // Revert optimistic update on error
        setOptimisticStrats(optimisticStrats);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={() => onDragChange(true)}
      onDragCancel={() => onDragChange(false)}
    >
      <SortableContext
        items={optimisticStrats.map((item) => item.strat._id)}
        strategy={verticalListSortingStrategy}
      >
        {optimisticStrats.map((strat, i) => (
          <StratItem
            key={strat.strat._id}
            team={team}
            strat={strat.strat}
            disabled={disabled || !strat.playable}
            highlightMap={i === 0 && !filter.map}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function StratItem({
  team,
  strat,
  disabled,
  highlightMap,
}: {
  team: FullTeam;
  strat: Strat;
  disabled: boolean;
  highlightMap: boolean;
}) {
  const copyStrat = useMutation(api.strats.createCopy);
  const { isLeading } = useFilter();
  const bannedOps = useQuery(api.bannedOps.get) ?? [];
  const router = useRouter();
  const { exportStratAsPNG } = useStratExport();

  const setActiveStrat = useMutation(api.activeStrat.set);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: strat._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const rowClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // edit strat name when double clicking
  const [editNameOfStrat, setEditNameOfStrat] = useState<Id<"strats"> | null>(
    null,
  );
  const [editNameValue, setEditNameValue] = useState("");
  const updateStrat = useMutation(api.strats.update);

  const openStrat = async () => {
    if (isLeading) {
      await setActiveStrat({ stratID: strat._id });
      router.push("/");
      return;
    }
    router.push(`/strat/${strat._id}`);
  };

  const handleRowClick = () => {
    if (rowClickTimeoutRef.current) {
      clearTimeout(rowClickTimeoutRef.current);
    }
    // Delay row open slightly so double-click name editing can cancel navigation.
    rowClickTimeoutRef.current = setTimeout(() => {
      void openStrat();
    }, 250);
  };

  return (
    <div
      key={strat._id}
      ref={setNodeRef}
      style={style}
      onClick={handleRowClick}
      onDoubleClick={() => {
        // open edit strat when double clicking anywhere on the row except the name (which has its own double click handler)
        if (rowClickTimeoutRef.current) {
          clearTimeout(rowClickTimeoutRef.current);
        }
        router.push(`/editor/${strat._id}`);
      }}
      className={cn(
        { "opacity-25": disabled },
        "flex items-center hover:bg-muted/50 py-2 border-y border-border border-collapse font-medium cursor-pointer",
      )}
    >
      <div style={{ width: TABLE_SIZES.handle }} className="pl-2">
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab hover:cursor-grabbing -ml-2 pl-2"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div
        style={{ width: TABLE_SIZES.map }}
        className={cn(!highlightMap && "text-muted-foreground/50")}
      >
        {strat.map}
      </div>
      <div style={{ width: TABLE_SIZES.site }}>{strat.site}</div>
      <div
        style={{ width: TABLE_SIZES.name }}
        onDoubleClick={(e) => {
          // edit strat name when double clicking
          if (rowClickTimeoutRef.current) {
            clearTimeout(rowClickTimeoutRef.current);
          }
          setEditNameOfStrat(strat._id);
          setEditNameValue(strat.name);
          e.stopPropagation();
        }}
      >
        {editNameOfStrat === strat._id ? (
          <Input
            value={editNameValue}
            onChange={(e) => setEditNameValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={() => {
              setEditNameOfStrat(null);
              updateStrat({ _id: strat._id, name: editNameValue });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditNameOfStrat(null);
                updateStrat({ _id: strat._id, name: editNameValue });
              } else if (e.key === "Escape") {
                setEditNameOfStrat(null);
              }
            }}
            autoFocus
            className="-m-2 outline-none border-none"
          />
        ) : (
          strat.name
        )}
      </div>
      <div
        className="flex justify-end pr-4"
        style={{ width: TABLE_SIZES.filters }}
      >
        {[
          ...(strat.filters?.attackers?.operators?.map((a) => ({
            type: "attackers" as const,
            op: a,
          })) || []),
          ...(strat.filters?.defenders?.operators.map((d) => ({
            type: "defenders" as const,
            op: d,
          })) || []),
        ].map(({ type, op }) => (
          <div className="relative" key={op}>
            <OperatorIcon op={op} />
            {((strat.filters?.[type]?.triggerOn === "banned" &&
              strat.filters[type].action === "show") ||
              (strat.filters?.[type]?.triggerOn === "available" &&
                strat.filters[type].action === "hide")) && (
              <Slash className="size-8 absolute top-0 left-0 opacity-70 text-destructive" />
            )}
          </div>
        ))}
      </div>
      <div
        style={{ width: TABLE_SIZES.ops }}
        className="flex gap-1 -my-2 overflow-hidden"
      >
        {strat.stratPositions
          .map((stratPosition) => ({
            ops: stratPosition.pickedOperators
              .map((op) => DEFENDERS.find((def) => def.name === op.operator)!)
              .filter(Boolean),
            isPowerPosition: stratPosition.isPowerPosition,
            _id: stratPosition._id,
            position: team.teamPositions.find(
              (p) => p._id === stratPosition.teamPositionID,
            ),
          }))
          .filter(({ ops }) => ops.length)
          .sort((a, b) => {
            if (a.isPowerPosition && !b.isPowerPosition) return -10;
            if (!a.isPowerPosition && b.isPowerPosition) return 10;
            return (a.position?.index ?? 0) - (b.position?.index ?? 0);
          })
          .map(({ ops, isPowerPosition, _id }) => (
            <OperatorIcon
              key={_id}
              op={ops.find((o) => !bannedOps.includes(o.name))?.name ?? ops[0]}
              className={isPowerPosition ? undefined : "grayscale scale-75"}
            />
          ))}
      </div>
      <div
        className="flex justify-end"
        style={{ width: TABLE_SIZES.actions }}
        onClick={(e) => e.stopPropagation()}
      >
        <Popover open={actionsOpen} onOpenChange={setActionsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer -my-1"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 p-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={async () => {
                setActionsOpen(false);
                await openStrat();
              }}
            >
              <Eye className="h-4 w-4" />
              Open
            </Button>
            <Link
              href={`/editor/${strat._id}`}
              onClick={() => setActionsOpen(false)}
              className="block"
            >
              <Button variant="ghost" className="w-full justify-start">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={async () => {
                if (duplicateLoading) return;
                setDuplicateLoading(true);
                try {
                  const res = await copyStrat({
                    stratID: strat._id,
                  });
                  if (!res.success) {
                    toast.error(`Error copying strat: ${res.error}`);
                  } else {
                    setActionsOpen(false);
                    router.push(`/editor/${res.stratID}`);
                  }
                } catch (error) {
                  console.error("Error copying strat:", error);
                  toast.error("Error copying strat");
                } finally {
                  setDuplicateLoading(false);
                }
              }}
            >
              {duplicateLoading ? <Spinner /> : <Copy className="h-4 w-4" />}
              Duplicate
            </Button>
            <PromiseButton
              variant="ghost"
              className="w-full justify-start"
              onClick={() => exportStratAsPNG(strat, team)}
              disabled={strat.drawingID !== undefined}
            >
              <Download className="h-4 w-4" />
              Export as Image
            </PromiseButton>
            <DeleteStratDialog
              stratID={strat._id}
              stratName={strat.name}
              trigger={
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              }
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
