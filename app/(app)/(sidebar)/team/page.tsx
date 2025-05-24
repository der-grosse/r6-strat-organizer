import { getPayload } from "@/src/auth/getPayload";
import { getInviteKeys } from "@/src/auth/inviteKeys";
import { getTeam } from "@/src/auth/team";
import { Metadata } from "next";
import TeamInfo from "./TeamInfo";
import TeamMembers from "./TeamMembers";
import TeamInviteKeys from "./TeamInviteKeys";
import TeamPlayerPositions from "./TeamPlayerPositions";

export const metadata: Metadata = {
  title: "Team Management",
};

export default async function TeamManagementPage() {
  const user = await getPayload();
  const team = await getTeam();
  const inviteKeys = user?.isAdmin ? await getInviteKeys() : [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {user?.isAdmin && <TeamInfo team={team} />}

      <TeamMembers team={team} />

      {user?.isAdmin && <TeamInviteKeys inviteKeys={inviteKeys} />}

      <TeamPlayerPositions team={team} canEdit={user?.isAdmin ?? false} />
    </div>
  );
}
