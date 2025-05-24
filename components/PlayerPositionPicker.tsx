import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
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
import { useState } from "react";
import { Button } from "./ui/button";
import { ColorButton, DEFAULT_COLORS } from "./ColorPickerDialog";
import { Label } from "./ui/label";
import { cn } from "@/src/utils";

export interface PlayerPositionPickerProps {
  positionID: PlayerPosition["id"] | null | undefined;
  onChange: (positionID: PlayerPosition["id"] | null) => void;
  team: Team;
  modal?: boolean;
  className?: string;
}

export default function PlayerPositionPicker(props: PlayerPositionPickerProps) {
  const [open, setOpen] = useState(false);

  const teamMember = props.team.members.find(
    (member) => member.id === props.positionID
  );
  const position = props.team.playerPositions.find(
    (pos) => pos.id === props.positionID
  );

  return (
    <Popover modal={props.modal} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn("text-left justify-start", props.className)}
        >
          {props.positionID ? (
            <>
              <ColorButton
                component="span"
                color={teamMember?.defaultColor ?? DEFAULT_COLORS[0]}
                size="small"
                disabled
              />
              <Label>
                {teamMember?.name ?? <em>No player available</em>}
                <span className="text-sm text-muted-foreground">
                  {position?.positionName}
                </span>
              </Label>
            </>
          ) : (
            <span className="text-muted-foreground">
              Select a player position
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-100" side="right">
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="clear"
                onSelect={() => {
                  props.onChange(null);
                  setOpen(false);
                }}
              >
                <em>Clear</em>
              </CommandItem>
            </CommandGroup>
            <CommandGroup>
              {props.team.playerPositions
                .toSorted((a) => (props.positionID === a.id ? -1 : 1))
                .map((position) => (
                  <CommandItem
                    key={position.id}
                    onSelect={() => {
                      props.onChange(position.id);
                      setOpen(false);
                    }}
                  >
                    {position.positionName}
                    <CommandShortcut>
                      {props.positionID === position.id && (
                        <Check className="text-muted-foreground" />
                      )}
                    </CommandShortcut>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandGroup>
              {props.team.members
                .toSorted((a) => (props.positionID === a.positionID ? -1 : 1))
                .map((member) => (
                  <CommandItem
                    key={member.id}
                    disabled={!member.positionID}
                    onSelect={() => {
                      if (!member.positionID) return;
                      props.onChange(member.positionID);
                      setOpen(false);
                    }}
                  >
                    <ColorButton
                      color={member.defaultColor ?? DEFAULT_COLORS[0]}
                      size="small"
                      disabled
                    />
                    {member.name}
                    <CommandShortcut>
                      {props.positionID === member.positionID && (
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
