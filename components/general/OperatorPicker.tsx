"use client";
import { ATTACKERS, DEFENDERS } from "@/lib/static/operator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import OperatorIcon from "./OperatorIcon";
import { Check, ChevronRight } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../ui/command";
import { useCallback, useRef, useState } from "react";
import { Separator } from "../ui/separator";
import { filterNull } from "../Objects";

export interface OperatorPickerProps<
  Multiple extends boolean,
  Value extends Multiple extends true ? string[] : string | null,
> {
  multiple?: Multiple;
  selected: Value;
  onChange: (value: Value) => void;
  trigger: React.FC<{ children: React.ReactNode }>;
  modal?: boolean;
  closeOnSelect?: boolean;
  hideOps?: string[];
  popoverOffset?: number;
  disabled?: boolean;
  side?: "defender" | "attacker" | "both";
}

export default function OperatorPicker<
  Multiple extends boolean = false,
  Value extends Multiple extends true ? string[] : string | null =
    Multiple extends true ? string[] : string | null,
>({
  side,
  selected,
  trigger: Trigger,
  multiple,
  onChange,
  modal,
  closeOnSelect,
  hideOps,
  popoverOffset,
  disabled,
}: OperatorPickerProps<Multiple, Value>) {
  const bannedOPInput = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);

  const afterSelect = useCallback(() => {
    if (closeOnSelect) setOpen(false);
    else
      setTimeout(() => {
        bannedOPInput.current?.focus();
      }, 200);
  }, [closeOnSelect]);

  const operators = (() => {
    const totalOps = [];
    const selectedArray = multiple
      ? (selected as string[])
      : selected
        ? [selected as string]
        : [];
    const selectedOps = selectedArray?.map(
      (op) => [...DEFENDERS, ...ATTACKERS].find((o) => o.name === op)!,
    );
    totalOps.push(...selectedOps);
    if (!side || side === "defender" || side === "both") {
      totalOps.push(
        ...DEFENDERS.filter(
          (def) =>
            !hideOps?.includes(def.name) && !selectedArray?.includes(def.name),
        ),
      );
    }
    if (!side || side === "attacker" || side === "both") {
      totalOps.push(
        ...ATTACKERS.filter(
          (atk) =>
            !hideOps?.includes(atk.name) && !selectedArray?.includes(atk.name),
        ),
      );
    }
    return totalOps;
  })();

  return (
    <Popover modal={modal} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Trigger>
          {Array.isArray(selected) ? (
            selected.length ? (
              (() => {
                const selectedDefender = filterNull(
                  selected.map((name) =>
                    DEFENDERS.find((op) => op.name === name),
                  ),
                );
                const selectedAttacker = filterNull(
                  selected.map((name) =>
                    ATTACKERS.find((op) => op.name === name),
                  ),
                );
                return (
                  <>
                    {selectedDefender.map((op) => (
                      <OperatorIcon key={op.name} op={op} className="-mx-1" />
                    ))}
                    {selectedDefender.length > 0 &&
                      selectedAttacker.length > 0 && (
                        <Separator orientation="vertical" />
                      )}
                    {selectedAttacker.map((op) => (
                      <OperatorIcon key={op.name} op={op} className="-mx-1" />
                    ))}
                  </>
                );
              })()
            ) : (
              "Select banned OPs"
            )
          ) : selected ? (
            <OperatorIcon
              op={
                [...DEFENDERS, ...ATTACKERS].find((o) => o.name === selected)!
              }
            />
          ) : (
            "Select banned OPs"
          )}
          <ChevronRight className="ml-auto" />
        </Trigger>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 z-100"
        side="right"
        sideOffset={popoverOffset}
      >
        <Command key={Array.isArray(selected) ? selected.join(",") : selected}>
          <CommandInput
            placeholder="Search for Operators..."
            ref={bannedOPInput}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="clear"
                onSelect={() => {
                  onChange((multiple ? [] : null) as Value);
                  afterSelect();
                }}
              >
                <em>Clear</em>
              </CommandItem>
              {operators
                .filter((def) => !hideOps?.includes(def.name))
                .toSorted((a) =>
                  Array.isArray(selected)
                    ? selected.includes(a.name)
                      ? -1
                      : 1
                    : selected === a.name
                      ? -1
                      : 1,
                )
                .map((op) => (
                  <CommandItem
                    key={op.name}
                    onSelect={() => {
                      onChange(
                        (multiple
                          ? selected?.includes(op.name)
                            ? (selected as string[]).filter(
                                (o) => o !== op.name,
                              )
                            : [...(selected as string[]), op.name]
                          : op.name) as Value,
                      );
                      afterSelect();
                    }}
                  >
                    <OperatorIcon op={op} />
                    {op.name}
                    <CommandShortcut>
                      {(Array.isArray(selected)
                        ? selected.includes(op.name)
                        : selected === op.name) && (
                        <Check className="text-muted-foreground" />
                      )}
                    </CommandShortcut>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
