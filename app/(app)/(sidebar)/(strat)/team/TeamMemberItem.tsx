import { useUser } from "@/components/context/UserContext";
import { ColorButton } from "@/components/general/ColorPickerDialog";
import UbisoftAvatar from "@/components/general/UbisoftAvatar";
import Ubisoft from "@/components/icons/ubisoft";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DEFAULT_COLORS } from "@/lib/static/colors";
import { TeamMember } from "@/lib/types/team.types";
import { useMutation, useQuery } from "convex/react";
import { MoreVertical, Shield, ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface TeamMemberItemProps {
  teamID: Id<"teams">;
  member: TeamMember;
  onChangeColor: () => void;
  onChangeUbisoftID?: () => void;
}

export default function TeamMemberItem({
  teamID,
  member,
  onChangeColor,
  onChangeUbisoftID,
}: TeamMemberItemProps) {
  const self = useQuery(api.self.get, {});
  const updateMember = useMutation(api.team.updateTeamMember);
  const removeMember = useMutation(api.team.removeTeamMember);

  const handleRemoveUser = async (userID: Id<"users">) => {
    try {
      await removeMember({ userID: member._id, teamID });
      toast.success("User removed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove user");
    }
  };

  const handlePromoteToAdmin = async (userID: Id<"users">) => {
    try {
      await updateMember({ userID, teamID, isAdmin: true });
      toast.success("User promoted to admin successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to promote user to admin");
    }
  };

  const handleDemoteFromAdmin = async (userID: Id<"users">) => {
    try {
      await updateMember({ userID, teamID, isAdmin: false });
      toast.success("User demoted from admin successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to demote user from admin");
    }
  };

  return (
    <TableRow key={member._id}>
      <TableCell className="w-[50px]">
        <ColorButton
          size="small"
          color={member.defaultColor ?? DEFAULT_COLORS.at(-1)}
          onClick={() => {
            onChangeColor();
          }}
          disabled={member._id !== self?._id && !self?.team?.isAdmin}
          className="align-middle m-auto"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center h-full align-middle">
          {member.ubisoftID && (
            <Tooltip>
              <TooltipTrigger className="mr-2 size-8">
                <UbisoftAvatar ubisoftID={member.ubisoftID} className="size-8" showUbisoftIndex />
              </TooltipTrigger>
              <TooltipContent>
                <span>Ubisoft ID provided: {member.ubisoftID}</span>
              </TooltipContent>
            </Tooltip>
          )}
          {member.name}
          {self?._id === member._id && (
            <span className="ml-2 text-muted-foreground text-sm">(You)</span>
          )}
        </div>
      </TableCell>
      <TableCell>{member.isAdmin ? "Admin" : "Member"}</TableCell>
      <TableCell>
        {new Date(member.memberSince).toLocaleDateString("de-DE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
      </TableCell>
      {self?.team?.isAdmin && (
        <TableCell>
          {member._id !== self?._id ? (
            <DropdownMenu modal>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={self?._id !== member._id && !self?.team?.isAdmin}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right">
                <DropdownMenuItem onClick={onChangeUbisoftID}>
                  <Ubisoft className="mr-2 h-4 w-4" />
                  {member.ubisoftID ? "Update Ubisoft ID" : "Add Ubisoft ID"}
                </DropdownMenuItem>
                {member.ubisoftID && (
                  <DropdownMenuItem
                    onClick={() =>
                      updateMember({
                        ubisoftID: "",
                        userID: member._id,
                        teamID,
                      })
                    }
                    className="text-destructive"
                  >
                    <div className="relative mr-2">
                      <Trash2 className="h-4 w-4" />
                      <Ubisoft className="absolute -right-1 -bottom-1 h-3 w-3" />
                    </div>
                    Remove Ubisoft ID
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {!member.isAdmin ? (
                  <DropdownMenuItem onClick={() => handlePromoteToAdmin(member._id)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Promote to Admin
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleDemoteFromAdmin(member._id)}>
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Demote from Admin
                  </DropdownMenuItem>
                )}
                {!member.isAdmin && (
                  <DropdownMenuItem
                    onClick={() => handleRemoveUser(member._id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove User
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Placeholder to keep the cell height
            <Button variant="ghost" size="icon" className="invisible pointer-events-none">
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}
