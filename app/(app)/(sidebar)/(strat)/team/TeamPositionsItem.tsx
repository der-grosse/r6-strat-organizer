import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronRight, GripVertical } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ColorButton } from "@/components/general/ColorPickerDialog";
import { FullTeam, TeamPosition } from "@/lib/types/team.types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface TeamPositionsItemProps {
  position: TeamPosition;
  canEdit: boolean;
  team: FullTeam;
}

export default function TeamPositionsItem({ canEdit, position, team }: TeamPositionsItemProps) {
  const updateTeamPosition = useMutation(api.team.updateTeamPosition);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: position._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="grid grid-cols-[auto_auto_1fr] gap-2" ref={setNodeRef} style={style}>
      {canEdit && (
        <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-gray-400 py-2 box-content" />
        </div>
      )}

      {canEdit ? (
        <>
          <Input
            defaultValue={position.positionName ?? ""}
            onBlur={(e) => {
              if (e.target.value !== position.positionName)
                updateTeamPosition({
                  teamID: team._id,
                  positionID: position._id,
                  positionName: e.target.value,
                });
            }}
          />
          <div className="h-9">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  {(() => {
                    const member = team.members.find((m) => m._id === position.playerID);
                    if (!member) return <em>Select player</em>;
                    return (
                      <>
                        <ColorButton component="span" color={member.defaultColor} size="small" />
                        {member.name}
                      </>
                    );
                  })()}
                  <ChevronRight className="ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="w-56">
                <DropdownMenuItem
                  key="clear"
                  onClick={() =>
                    updateTeamPosition({
                      teamID: team._id,
                      positionID: position._id,
                      playerID: null,
                    })
                  }
                >
                  <em>Clear</em>
                </DropdownMenuItem>
                {team.members.map((member) => (
                  <DropdownMenuItem
                    key={member.name}
                    onClick={() =>
                      updateTeamPosition({
                        teamID: team._id,
                        positionID: position._id,
                        playerID: member._id,
                      })
                    }
                  >
                    <ColorButton component="span" color={member.defaultColor} size="small" />
                    {member.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        <>
          <span className="min-w-48">{position.positionName}</span>
          <span className="text-sm flex items-center gap-1">
            {(() => {
              const member = team.members.find((m) => m._id === position.playerID);
              if (!member) return <em>Unassigned</em>;
              return (
                <>
                  <ColorButton
                    component="span"
                    color={member.defaultColor}
                    size="small"
                    className="inline-block align-sub mr-1"
                  />
                  {member.name}
                </>
              );
            })()}
          </span>
        </>
      )}
    </div>
  );
}
