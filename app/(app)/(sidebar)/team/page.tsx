import TeamManagement from "./TeamManagement";
import { getPayload } from "@/src/auth/getPayload";
import { getInviteKeys } from "@/src/auth/inviteKeys";
import { getTeamName, getTeamMembers } from "@/src/auth/team";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Management",
};

export default async function TeamManagementPage() {
  const user = await getPayload();
  const teamUsers = await getTeamMembers();
  const teamName = await getTeamName();
  const inviteKeys = user?.isAdmin ? await getInviteKeys() : [];

  return (
    <TeamManagement
      teamUsers={teamUsers}
      teamName={teamName}
      inviteKeys={inviteKeys}
    />
  );
}
