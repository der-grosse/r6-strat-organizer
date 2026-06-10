"use client";
import { Separator } from "@/components/ui/separator";
import { Fragment, useEffect, useMemo, useState } from "react";
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
import TeamPositionsItem from "./TeamPositionsItem";
import { FullTeam } from "@/lib/types/team.types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface TeamPositionsListProps {
  team: FullTeam;
  canEdit: boolean;
}

export default function TeamPositionsList(props: TeamPositionsListProps) {
  const updateTeamPosition = useMutation(api.team.updateTeamPosition);

  const [optimisticPositions, setOptimisticPositions] = useState(props.team.teamPositions);
  useEffect(() => {
    setOptimisticPositions(props.team.teamPositions);
  }, [props.team.teamPositions]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = optimisticPositions.findIndex((item) => item._id === active.id);
      const newIndex = optimisticPositions.findIndex((item) => item._id === over?.id);

      // Optimistically update the UI
      const newPositions = arrayMove(optimisticPositions, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          index,
        }),
      );
      setOptimisticPositions(newPositions);

      try {
        await updateTeamPosition({
          positionID: active.id as Id<"teamPositions">,
          teamID: props.team._id,
          index: newIndex,
        });
      } catch (error) {
        console.error("Error updating member positions:", error);
        // Revert optimistic update on error
        setOptimisticPositions(optimisticPositions);
      }
    }
  };

  const items = optimisticPositions.map((position, i) => (
    <Fragment key={position._id}>
      <TeamPositionsItem canEdit={props.canEdit} position={position} team={props.team} />
      {i < props.team.teamPositions.length - 1 && <Separator />}
    </Fragment>
  ));

  return (
    <div className="flex flex-col gap-2">
      {props.canEdit ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={optimisticPositions.map((item) => item._id)}
            strategy={verticalListSortingStrategy}
          >
            {items}
          </SortableContext>
        </DndContext>
      ) : (
        items
      )}
    </div>
  );
}
