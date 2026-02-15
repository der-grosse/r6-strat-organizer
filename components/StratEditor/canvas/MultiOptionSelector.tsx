import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouchRef = useRef(false);

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

  // Close the menu when tapping outside on touch devices
  useEffect(() => {
    if (!open) return;

    function handleTouchOutside(e: TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("touchstart", handleTouchOutside);
    return () => {
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, [open]);

  const handleTouchStart = useCallback(() => {
    isTouchRef.current = true;
  }, []);

  const handleMouseEnter = useCallback(() => {
    // Don't open on hover if the interaction was initiated by touch
    if (isTouchRef.current) {
      isTouchRef.current = false;
      return;
    }
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isTouchRef.current) return;
    setOpen(false);
  }, []);

  const handleToggleClick = useCallback(() => {
    // On touch devices, toggle the menu on tap
    setOpen((prev) => !prev);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("group relative size-9", !open && "overflow-hidden")}
      onTouchStart={handleTouchStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
            onClick={handleToggleClick}
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
              if (!open) {
                // First tap on the selected item opens the menu (touch)
                setOpen(true);
                return;
              }
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
