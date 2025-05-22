import { DEFENDERS } from "@/src/static/operator";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
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
} from "./ui/command";
import { useRef } from "react";

export interface OperatorPickerProps<
  Multiple extends boolean,
  Value extends Multiple extends true ? string[] : string | null
> {
  multiple?: Multiple;
  selected: Value;
  onChange: (value: Value) => void;
  trigger: React.FC<{ children: React.ReactNode }>;
  modal?: boolean;
}

export default function OperatorPicker<
  Multiple extends boolean = false,
  Value extends Multiple extends true
    ? string[]
    : string | null = Multiple extends true ? string[] : string | null
>({
  selected,
  trigger: Trigger,
  multiple,
  onChange,
  modal,
}: OperatorPickerProps<Multiple, Value>) {
  const bannedOPInput = useRef<HTMLInputElement>(null);

  return (
    <Popover modal={modal}>
      <PopoverTrigger asChild>
        <Trigger>
          {Array.isArray(selected) ? (
            selected.length ? (
              selected
                .map((op) => DEFENDERS.find((o) => o.name === op))
                .filter(Boolean)
                .map((op) => <OperatorIcon key={op!.name} op={op!} />)
            ) : (
              "Select banned OPs"
            )
          ) : selected ? (
            <OperatorIcon op={DEFENDERS.find((o) => o.name === selected)!} />
          ) : (
            "Select banned OPs"
          )}
          <ChevronRight className="ml-auto" />
        </Trigger>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-100" side="right">
        <Command key={Array.isArray(selected) ? selected.join(",") : selected}>
          <CommandInput
            placeholder="Type a command or search..."
            ref={bannedOPInput}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="clear"
                onSelect={() => onChange((multiple ? [] : null) as Value)}
              >
                <em>Clear</em>
              </CommandItem>
              {DEFENDERS.toSorted((a) =>
                Array.isArray(selected)
                  ? selected.includes(a.name)
                    ? -1
                    : 1
                  : selected === a.name
                  ? -1
                  : 1
              ).map((op) => (
                <CommandItem
                  key={op.name}
                  onSelect={() => {
                    onChange(
                      (multiple
                        ? selected?.includes(op.name)
                          ? (selected as string[]).filter((o) => o !== op.name)
                          : [...(selected as string[]), op.name]
                        : op.name) as Value
                    );
                    requestAnimationFrame(() => {
                      bannedOPInput.current?.focus();
                    });
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
