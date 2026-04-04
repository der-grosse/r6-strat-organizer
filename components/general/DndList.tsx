"use client";
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
import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Render<Item> = (
  item: Item,
  props: {
    ref: (node: HTMLElement | null) => void;
    style: {
      transform: string | undefined;
      transition: string | undefined;
    };
  },
  handle: React.ReactNode,
) => React.ReactNode;

export interface DndListProps<Item extends { id: string | number }> {
  items: Item[];
  onChange: (
    items: Item[],
    movedItem: Item,
    oldIndex: number,
    newIndex: number,
  ) => void | Promise<void>;
  children: Render<Item>;
  disabled?: boolean;
  slots?: {
    handle?: {
      className?: string;
    };
  };
}

export default function DndList<Item extends { id: string | number }>(
  props: DndListProps<Item>,
) {
  const [optimisticItems, setOptimisticItems] = useState(props.items);
  useEffect(() => {
    setOptimisticItems(props.items);
  }, [props.items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = optimisticItems.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = optimisticItems.findIndex(
        (item) => item.id === over?.id,
      );

      // Optimistically update the UI
      const movedItem = optimisticItems[oldIndex];
      const newStrats = arrayMove(optimisticItems, oldIndex, newIndex);
      setOptimisticItems(newStrats);

      try {
        await props.onChange(newStrats, movedItem, oldIndex, newIndex);
      } catch (error) {
        console.error("Error during onChange of DndList:", error);
        // Revert optimistic update on error
        setOptimisticItems(optimisticItems);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={optimisticItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {optimisticItems.map((item) => (
          <DndListItem
            slots={{
              handle: props.slots?.handle,
            }}
            key={item.id}
            item={item}
            disabled={props.disabled}
            render={props.children}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function DndListItem<Item extends { id: string | number }>(props: {
  item: Item;
  disabled?: boolean;
  render: Render<Item>;
  slots?: {
    handle?: {
      className?: string;
    };
  };
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return props.render(
    props.item,
    {
      ref: setNodeRef,
      style,
    },
    <div
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab hover:cursor-grabbing",
        props.slots?.handle?.className,
      )}
    >
      <GripVertical className="h-4 w-4 text-gray-400" />
    </div>,
  );
}
