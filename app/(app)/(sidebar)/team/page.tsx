import { getTeamUsers, getInviteKeys, getTeamName } from "@/src/auth/auth";
import TeamManagement from "./TeamManagement";
import { getPayload } from "@/src/auth/getPayload";

export default async function TeamManagementPage() {
  const user = await getPayload();
  const teamUsers = await getTeamUsers();
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
