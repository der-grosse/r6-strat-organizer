import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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
import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { ColorButton } from "./ColorPickerDialog";
import { DEFAULT_COLORS } from "@/lib/static/colors";
import { FullTeam, TeamPosition } from "@/lib/types/team.types";

export interface TeamPositionPickerProps {
  teamPositionID: TeamPosition["_id"] | null | undefined;
  onChange: (positionID: TeamPosition["_id"] | null) => void;
  team: FullTeam;
  modal?: boolean;
  popoverOffset?: number;
  className?: string;
}

export default function TeamPositionPicker(props: TeamPositionPickerProps) {
  const [open, setOpen] = useState(false);

  const teamMember = props.team.members.find(
    (member) => member.teamPositionID === props.teamPositionID,
  );
  const position = props.team.teamPositions.find(
    (teamPos) => teamPos._id === props.teamPositionID,
  );

  return (
    <Popover modal={props.modal} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn("text-left justify-start", props.className)}
        >
          {props.teamPositionID ? (
            <>
              <ColorButton
                component="span"
                color={teamMember?.defaultColor ?? DEFAULT_COLORS.at(-1)}
                size="small"
                className="flex-[0_0_auto]"
                disabled
              />
              <Label className="truncate">
                {teamMember?.name ?? <em>No player available</em>}
                <span className="text-sm text-muted-foreground">
                  {position?.positionName}
                </span>
              </Label>
            </>
          ) : (
            <span className="text-muted-foreground text-ellipsis">
              Select a player position
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 z-100"
        side="right"
        sideOffset={props.popoverOffset}
      >
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList className="max-h-[600px]">
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
              {props.team.teamPositions.map((teamPosition) => (
                <CommandItem
                  key={teamPosition._id}
                  onSelect={() => {
                    props.onChange(teamPosition._id);
                    setOpen(false);
                  }}
                >
                  {teamPosition.positionName}
                  <CommandShortcut>
                    {props.teamPositionID === teamPosition._id && (
                      <Check className="text-muted-foreground" />
                    )}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              {props.team.members
                .toSorted((a, b) => {
                  if (a.teamPositionID && b.teamPositionID) {
                    const indexA = props.team.teamPositions.findIndex(
                      (teamPos) => teamPos._id === a.teamPositionID,
                    );
                    const indexB = props.team.teamPositions.findIndex(
                      (teamPos) => teamPos._id === b.teamPositionID,
                    );
                    return indexA - indexB;
                  }
                  return 0;
                })
                .map((member) => (
                  <CommandItem
                    key={member._id}
                    disabled={!member.teamPositionID}
                    onSelect={() => {
                      if (!member.teamPositionID) return;
                      props.onChange(member.teamPositionID);
                      setOpen(false);
                    }}
                  >
                    <ColorButton
                      color={member.defaultColor ?? DEFAULT_COLORS.at(-1)}
                      size="small"
                      disabled
                    />
                    {member.name}
                    <CommandShortcut>
                      {props.teamPositionID === member.teamPositionID && (
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
