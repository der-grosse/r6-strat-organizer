import React, { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dot } from "lucide-react";

export interface MultiOptionSelectorProps<
  ID extends string | number,
  Item extends { id: ID; icon: React.ReactNode; label: string }
> {
  options: Item[];
  selected: ID | null;
  emptyIcon?: React.ReactNode;
  onSelect: (id: ID) => void;
}

export default function MultiOptionSelector<
  ID extends string | number,
  Item extends { id: ID; icon: React.ReactNode; label: string }
>({
  options,
  selected,
  emptyIcon,
  onSelect,
}: MultiOptionSelectorProps<ID, Item>) {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.id === selected),
    [options, selected]
  );
  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.id === selected),
    [options, selected]
  );

  const offset = (() => {
    if (!selectedOption) return 0;
    return selectedIndex * 36;
  })();

  return (
    <div
      className={cn("group relative size-9", !open && "overflow-hidden")}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
      role="group"
      aria-label="Multi option selector"
      aria-expanded={open}
    >
      <div
        className="absolute left-0 w-full z-10 flex flex-col transition-[top] bg-muted rounded-md shadow-md"
        style={{ top: -offset }}
      >
        {!selectedOption && (
          <ItemButton
            isActive={open}
            label="No option selected"
            onClick={() => {}}
          >
            {emptyIcon ?? <Dot />}
          </ItemButton>
        )}
        {options.map((option) => (
          <ItemButton
            key={option.id}
            isActive={open && option.id === selectedOption?.id}
            label={option.label}
            onClick={() => {
              onSelect(option.id);
              setOpen(false);
            }}
          >
            {option.icon}
          </ItemButton>
        ))}
      </div>
    </div>
  );
}

function ItemButton({
  onClick,
  children,
  label,
  isActive,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-pressed={isActive}
    >
      <span className="sr-only">{label}</span>
      {children}
    </Button>
  );
}
