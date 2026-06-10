"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import ColorPickerDialog from "@/components/general/ColorPickerDialog";
import TeamMemberList from "./TeamMemberList";
import { DEFAULT_COLORS } from "@/lib/static/colors";
import ChangeUbisoftIDDialog from "./ChangeUbisoftIDDialog";
import { FullTeam, TeamMember } from "@/lib/types/team.types";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface TeamMembersProps {
  team: FullTeam;
}

export default function TeamMembers(props: TeamMembersProps) {
  const updateTeamMember = useMutation(api.team.updateTeamMember);

  const [userColorChangeOpen, setUserColorChangeOpen] = useState(false);
  const [userColorID, setUserColorID] = useState<Id<"users"> | null>(null);

  const [changeUbisoftIDOpen, setChangeUbisoftIDOpen] = useState(false);
  const [changeUbisoftIDUser, setChangeUbisoftIDUser] = useState<TeamMember | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMemberList
            teamID={props.team._id}
            members={props.team.members}
            onChangeColor={(member) => {
              setUserColorID(member._id);
              setUserColorChangeOpen(true);
            }}
            onChangeUbisoftID={(member) => {
              // Otherwise there is an issue with dropdown menu closing and dialog opening at the same time
              // which leaves the body non interactable with pointer-events: none;
              setTimeout(() => {
                setChangeUbisoftIDUser(member);
                setChangeUbisoftIDOpen(true);
              });
            }}
          />
        </CardContent>
      </Card>

      <ColorPickerDialog
        open={userColorChangeOpen}
        onClose={() => setUserColorChangeOpen(false)}
        color={
          props.team.members.find((u) => u._id === userColorID)?.defaultColor ??
          DEFAULT_COLORS.at(-1)
        }
        onChange={async (color) => {
          if (userColorID)
            await updateTeamMember({
              defaultColor: color,
              userID: userColorID,
              teamID: props.team._id,
            });
          setUserColorID(null);
          setUserColorChangeOpen(false);
        }}
      />

      <ChangeUbisoftIDDialog
        teamID={props.team._id}
        open={changeUbisoftIDOpen}
        onClose={() => setChangeUbisoftIDOpen(false)}
        member={changeUbisoftIDUser}
      />
    </>
  );
}
