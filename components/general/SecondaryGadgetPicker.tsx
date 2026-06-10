import {
  DEFENDER_SECONDARY_GADGETS,
  DEFENDERS,
  DefenderSecondaryGadgetID,
} from "@/lib/static/operator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronRight, CircleOff } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../ui/command";
import { useMemo, useRef, useState } from "react";
import GadgetIcon from "./GadgetIcon";
import { Button } from "../ui/button";

export interface SecondaryGadgetPickerProps {
  selected: DefenderSecondaryGadgetID | undefined;
  onChange: (value: DefenderSecondaryGadgetID | undefined) => void;
  trigger?: React.FC<{ children: React.ReactNode }>;
  modal?: boolean;
  closeOnSelect?: boolean;
  showGadgetOfOperators?: string[];
  popoverOffset?: number;
  onlyShowIcon?: boolean;
  slotProps?: Partial<{
    icon: {
      className?: string;
    };
  }>;
}

export default function SecondaryGadgetPicker({
  selected,
  onChange,
  trigger,
  modal,
  closeOnSelect,
  showGadgetOfOperators,
  popoverOffset,
  onlyShowIcon,
  slotProps,
}: SecondaryGadgetPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);

  const selectedGadget = useMemo(
    () => DEFENDER_SECONDARY_GADGETS.find((g) => g.id === selected),
    [selected],
  );

  const prioritizedGadgets = useMemo(() => {
    if (!showGadgetOfOperators) {
      return [
        ...(selectedGadget ? [selectedGadget] : []),
        ...DEFENDER_SECONDARY_GADGETS.filter((g) => g.id !== selected),
      ];
    } else {
      const gadgetIDsOfOps = Array.from(
        new Set(
          DEFENDERS.filter((def) => showGadgetOfOperators?.includes(def.name)).flatMap(
            (def) => def.secondaryGadgets,
          ),
        ),
      ).filter((id) => id !== selected);
      return [
        ...(selectedGadget ? [selectedGadget] : []),
        ...DEFENDER_SECONDARY_GADGETS.filter((g) => gadgetIDsOfOps.includes(g.id)),
      ];
    }
  }, [selectedGadget, showGadgetOfOperators]);

  const otherGadgets = useMemo(() => {
    return DEFENDER_SECONDARY_GADGETS.filter(
      (g) => !prioritizedGadgets.some((prio) => prio.id === g.id),
    );
  }, [prioritizedGadgets]);

  const Trigger = trigger || Button;

  return (
    <Popover modal={modal} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Trigger>
          {selected ? (
            <>
              <GadgetIcon id={selected} className={slotProps?.icon?.className} />
              {!onlyShowIcon && selectedGadget?.name}
            </>
          ) : (
            <>
              <CircleOff />
              {!onlyShowIcon && "Select secondary gadget"}
            </>
          )}
          {!onlyShowIcon && (
            <>
              <ChevronRight />
              <div className="flex-1" />
            </>
          )}
        </Trigger>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-100" side="right" sideOffset={popoverOffset}>
        <Command key={selected}>
          <CommandInput placeholder="Search for gadgets" ref={inputRef} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="clear"
                onSelect={() => {
                  onChange(undefined);
                  if (closeOnSelect) setOpen(false);
                }}
              >
                <em>Clear</em>
              </CommandItem>
              {prioritizedGadgets.map((gadget) => (
                <CommandItem
                  key={gadget.name}
                  onSelect={() => {
                    onChange(gadget.id);
                    if (closeOnSelect) setOpen(false);
                    else
                      requestAnimationFrame(() => {
                        inputRef.current?.focus();
                      });
                  }}
                >
                  <GadgetIcon id={gadget.id} />
                  {gadget.name}
                  <CommandShortcut>
                    {selected === gadget.id && <Check className="text-muted-foreground" />}
                  </CommandShortcut>
                </CommandItem>
              ))}
              {otherGadgets.length > 0 && prioritizedGadgets.length > 0 && <CommandSeparator />}
              {otherGadgets.map((gadget) => (
                <CommandItem
                  key={gadget.name}
                  onSelect={() => {
                    onChange(gadget.id);
                    if (closeOnSelect) setOpen(false);
                    else
                      requestAnimationFrame(() => {
                        inputRef.current?.focus();
                      });
                  }}
                >
                  <GadgetIcon id={gadget.id} />
                  {gadget.name}
                  <CommandShortcut>
                    {selected === gadget.id && <Check className="text-muted-foreground" />}
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
