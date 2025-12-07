import OperatorIcon from "@/components/general/OperatorIcon";
import OperatorPicker from "@/components/general/OperatorPicker";
import TeamPositionPicker from "@/components/general/PlayerPositionPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GripVertical, Plus, X, Zap, ZapOff } from "lucide-react";
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
import { forwardRef, useState } from "react";
import { useEffect } from "react";
import Shotgun from "../assets/Shotgun";
import SecondaryGadgetPicker from "@/components/general/SecondaryGadgetPicker";
import { DEFENDERS, DefenderSecondaryGadget } from "@/lib/static/operator";
import { PickedOperator, Strat, StratPositions } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface StratPositionItemProps {
  stratID: Strat["_id"];
  team: FullTeam;
  stratPosition: StratPositions;
  hasError?: boolean;
}

export default function StratPositionItem({
  stratID,
  team,
  stratPosition,
  hasError,
}: StratPositionItemProps) {
  const updateStratPosition = useMutation(api.strats.updateStratPosition);
  const updatePickedOperator = useMutation(api.strats.updatePickedOperator);
  const updatePickedOperatorIndex = useMutation(
    api.strats.updatePickedOperatorIndex
  );
  const deletePickedOperator = useMutation(api.strats.deletePickedOperator);
  const createPickedOperator = useMutation(api.strats.createPickedOperator);

  const [optimisticOps, setOptimisticOps] = useState(
    stratPosition.pickedOperators
  );
  useEffect(() => {
    setOptimisticOps(stratPosition.pickedOperators);
  }, [stratPosition.pickedOperators]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = optimisticOps.findIndex((op) => op._id === active.id);
      const newIndex = optimisticOps.findIndex((op) => op._id === over?.id);

      // Optimistically update the UI
      const newPositions = arrayMove(optimisticOps, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          index,
        })
      );
      setOptimisticOps(newPositions);

      try {
        await updatePickedOperatorIndex({
          stratPositionID: stratPosition._id,
          pickedOperatorID: active.id as Id<"pickedOperators">,
          newIndex,
        });
      } catch (error) {
        console.error("Error updating member positions:", error);
        // Revert optimistic update on error
        setOptimisticOps(optimisticOps);
      }
    }
  };

  return (
    <Card className="p-2 gap-0">
      <CardHeader className="p-0 w-full">
        <div
          className={cn(
            "flex items-center w-full overflow-hidden",
            hasError && "outline-2 outline-destructive rounded-md"
          )}
        >
          <TeamPositionPicker
            className="flex-1 px-2 overflow-hidden truncate w-[calc(100%_-_var(--spacing)_*_12)]"
            popoverOffset={88}
            teamPositionID={stratPosition.teamPositionID}
            team={team}
            onChange={(teamPositionID) => {
              updateStratPosition({
                _id: stratPosition._id,
                teamPositionID,
              });
            }}
          />
          {/* rotation duties */}
          <Tooltip delayDuration={1000}>
            <TooltipTrigger className="size-9">
              <ShotgunToggle
                shouldBringShotgun={stratPosition.shouldBringShotgun}
                stratPositionID={stratPosition._id}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-sm">Shotgun for rotates</p>
              <p className="text-xs text-muted-foreground">
                Indicate wether this role needs to bring a shotgun to make
                rotates, headholes or similar.
              </p>
            </TooltipContent>
          </Tooltip>
          {/* power position */}
          <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  stratPosition.isPowerPosition
                    ? "text-primary"
                    : "text-muted-foreground/50"
                )}
                onClick={() =>
                  updateStratPosition({
                    _id: stratPosition._id,
                    isPowerPosition: !stratPosition.isPowerPosition,
                  })
                }
              >
                {stratPosition.isPowerPosition ? <Zap /> : <ZapOff />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-sm">
                {stratPosition.isPowerPosition
                  ? "Remove from power positions"
                  : "Set as power position"}
              </p>
              <p className="text-xs text-muted-foreground">
                Power positions are essential to a strat. If this position is
                not playable due to operator bans, the strat is not viable
                anymore.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="px-0 mt-1 -mb-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={optimisticOps.map((item) => ({
              ...item,
              id: item._id,
            }))}
            strategy={verticalListSortingStrategy}
          >
            {optimisticOps.map((op) => (
              <OperatorItem
                key={op._id}
                op={op}
                otherOps={optimisticOps
                  .filter((op2) => op2._id !== op._id)
                  .map((op2) => op2.operator)}
                onDelete={() => {
                  const newOps = [...stratPosition.pickedOperators];
                  newOps.splice(op.index, 1);
                  deletePickedOperator({
                    pickedOperatorID:
                      stratPosition.pickedOperators[op.index]._id,
                  });
                  setOptimisticOps(newOps);
                }}
                onChange={(op) => {
                  const newOps = [...stratPosition.pickedOperators];
                  newOps[op.index] = op;
                  updatePickedOperator({
                    operator: op.operator,
                    secondaryGadget: op.secondaryGadget,
                    tertiaryGadget: op.tertiaryGadget,
                    pickedOperatorID: op._id,
                  });
                  setOptimisticOps(newOps);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
        <div className="flex">
          <OperatorPicker
            closeOnSelect
            selected={null as string | null}
            onChange={(op) => {
              if (!op) return;
              createPickedOperator({
                stratPositionID: stratPosition._id,
                operator: op,
              });
              setOptimisticOps((prev) => [
                ...prev,
                {
                  _id: "UNSET" as Id<"pickedOperators">,
                  operator: op,
                  index: prev.length,
                  stratPositionID: stratPosition._id,
                  secondaryGadget: undefined,
                  tertiaryGadget: undefined,
                },
              ]);
            }}
            trigger={({ children, ...props }) => (
              <Button
                {...props}
                variant="ghost"
                className="px-3 w-full text-left justify-start text-muted-foreground"
              >
                <Plus className="size-4 mr-1" />
                Add Operator
              </Button>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function OperatorItem({
  op,
  onDelete,
  onChange,
  otherOps,
}: {
  op: PickedOperator;
  onDelete: () => void;
  onChange: (pickedOperator: PickedOperator) => void;
  otherOps: string[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: op._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasTertiaryGadget =
    "tertiaryGadgets" in
    (DEFENDERS.find((def) => def.name === op.operator) || {});

  return (
    <div ref={setNodeRef} style={style} className="flex pl-3">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-gray-400 py-2 box-content" />
      </div>
      <OperatorPicker
        popoverOffset={80}
        closeOnSelect
        selected={op.operator}
        hideOps={otherOps}
        onChange={(newOp) => {
          if (!newOp) onDelete();
          else {
            const hasNewOpTertiary =
              "tertiaryGadgets" in
              (DEFENDERS.find((def) => def.name === newOp) || {});
            onChange({
              operator: newOp,
              secondaryGadget: op.secondaryGadget,
              tertiaryGadget: hasNewOpTertiary ? op.tertiaryGadget : undefined,
              _id: op._id,
              index: op.index,
              stratPositionID: op.stratPositionID,
            });
          }
        }}
        trigger={({ children, ...props }) => (
          <Button
            {...props}
            variant="ghost"
            className="px-1 flex-1 text-left justify-start"
          >
            <OperatorIcon op={op.operator} />
            {op.operator}
            <div className="flex-1" />
          </Button>
        )}
      />
      <SecondaryGadgetPicker
        onChange={(gadget) =>
          onChange({
            operator: op.operator,
            secondaryGadget: gadget,
            tertiaryGadget: op.tertiaryGadget,
            _id: op._id,
            index: op.index,
            stratPositionID: op.stratPositionID,
          })
        }
        selected={op.secondaryGadget as DefenderSecondaryGadget | undefined}
        popoverOffset={52}
        closeOnSelect
        onlyShowIcon
        showGadgetOfOperators={[op.operator]}
        slotProps={{
          icon: {
            className: "size-6",
          },
        }}
        trigger={(props) => (
          <Button
            {...props}
            variant="ghost"
            size="icon"
            className="text-muted-foreground -ml-2 gap-1"
          />
        )}
      />
      {hasTertiaryGadget && (
        <SecondaryGadgetPicker
          onChange={(gadget) =>
            onChange({
              operator: op.operator,
              secondaryGadget: op.secondaryGadget,
              tertiaryGadget: gadget,
              _id: op._id,
              index: op.index,
              stratPositionID: op.stratPositionID,
            })
          }
          selected={op.tertiaryGadget as DefenderSecondaryGadget | undefined}
          popoverOffset={52}
          closeOnSelect
          onlyShowIcon
          showGadgetOfOperators={[op.operator]}
          slotProps={{
            icon: {
              className: "size-6",
            },
          }}
          trigger={(props) => (
            <Button
              {...props}
              variant="ghost"
              size="icon"
              className="text-muted-foreground -ml-2 gap-1"
            />
          )}
        />
      )}
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={() => onDelete()}
      >
        <span role="button">
          <X />
        </span>
      </Button>
    </div>
  );
}

const ShotgunToggle = forwardRef<
  HTMLButtonElement,
  {
    shouldBringShotgun: boolean;
    stratPositionID: Id<"stratPositions">;
  }
>(({ shouldBringShotgun, stratPositionID }, ref) => {
  const updateStratPosition = useMutation(api.strats.updateStratPosition);
  return (
    <Button
      ref={ref}
      size="icon"
      variant="ghost"
      onClick={() => {
        updateStratPosition({
          _id: stratPositionID,
          shouldBringShotgun: !shouldBringShotgun,
        });
      }}
      asChild
    >
      <span>
        <Shotgun
          className={cn(
            "size-8 -mx-1 -my-2",
            !shouldBringShotgun && "text-muted-foreground/50"
          )}
        />
      </span>
    </Button>
  );
});
