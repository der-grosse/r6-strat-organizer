"use client";
import { useFilter } from "@/components/context/FilterContext";
import OperatorIcon from "@/components/general/OperatorIcon";
import { Button } from "@/components/ui/button";
import { DEFENDERS } from "@/lib/static/operator";
import { Copy, Eye, GripVertical, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreateStratDialog } from "./CreateStratDialog";
import { useEffect, useMemo, useState } from "react";
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

const TABLE_SIZES = {
  handle: "5%",
  map: "10%",
  site: "15%",
  name: "35%",
  ops: "20%",
  actions: "15%",
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
        {} as Record<string, typeof strats>
      )
    );
  }, [strats]);

  return (
    <div className="w-full h-full p-4 flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-1 items-center">
        <div />
        <p className="text-center text-muted-foreground leading-none">
          All Strats
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
          <div className="font-bold pl-1" style={{ width: TABLE_SIZES.ops }}>
            Operators
          </div>
          <div
            className="font-bold pl-2"
            style={{ width: TABLE_SIZES.actions }}
          >
            Actions
          </div>
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
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    onDragChange(false);

    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = optimisticStrats.findIndex(
        (item) => item.strat._id === active.id
      );
      const newIndex = optimisticStrats.findIndex(
        (item) => item.strat._id === over?.id
      );

      // Optimistically update the UI
      const newStrats = arrayMove(optimisticStrats, oldIndex, newIndex);
      setOptimisticStrats(
        newStrats.map((strat, i) => ({
          ...strat,
          mapIndex: i,
        }))
      );

      try {
        const res = await updateStratIndex({
          stratID: active.id as Id<"strats">,
          newIndex,
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

  const setActiveStrat = useMutation(api.activeStrat.set);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: strat._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [duplicateLoading, setDuplicateLoading] = useState(false);

  // edit strat name when double clicking
  const [editNameOfStrat, setEditNameOfStrat] = useState<Id<"strats"> | null>(
    null
  );
  const [editNameValue, setEditNameValue] = useState("");
  const updateStrat = useMutation(api.strats.update);

  return (
    <div
      key={strat._id}
      ref={setNodeRef}
      style={style}
      className={cn(
        { "opacity-25": disabled },
        "flex items-center hover:bg-muted/50 py-2 border-y border-border border-collapse font-medium"
      )}
    >
      <div style={{ width: TABLE_SIZES.handle }} className="pl-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing"
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
        className="h-full"
        onDoubleClick={(e) => {
          // edit strat name when double clicking
          setEditNameOfStrat(strat._id);
          setEditNameValue(strat.name);
          e.stopPropagation();
        }}
      >
        {editNameOfStrat === strat._id ? (
          <Input
            value={editNameValue}
            onChange={(e) => setEditNameValue(e.target.value)}
            onBlur={() => {
              setEditNameOfStrat(null);
              updateStrat({ _id: strat._id, name: editNameValue });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditNameOfStrat(null);
                updateStrat({ _id: strat._id, name: editNameValue });
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
              (p) => p._id === stratPosition.teamPositionID
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
      <div className="flex gap-1 -my-2" style={{ width: TABLE_SIZES.actions }}>
        {(() => {
          const button = (
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={async () => {
                if (isLeading) {
                  await setActiveStrat({ stratID: strat._id });
                  router.push("/");
                }
              }}
            >
              <Eye />
            </Button>
          );
          if (isLeading) {
            return button;
          } else {
            return <Link href={`/strat/${strat._id}`}>{button}</Link>;
          }
        })()}
        <Link href={`/editor/${strat._id}`}>
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Pencil />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
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
          {duplicateLoading ? <Spinner /> : <Copy />}
        </Button>
        <DeleteStratDialog stratID={strat._id} stratName={strat.name} />
      </div>
    </div>
  );
}
