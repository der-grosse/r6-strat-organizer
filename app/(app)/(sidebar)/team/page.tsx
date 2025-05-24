import TeamManagement from "./TeamManagement";
import { getPayload } from "@/src/auth/getPayload";
import { getInviteKeys } from "@/src/auth/inviteKeys";
import { getTeam } from "@/src/auth/team";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Management",
};

export default async function TeamManagementPage() {
  const user = await getPayload();
  const team = await getTeam();
  const inviteKeys = user?.isAdmin ? await getInviteKeys() : [];

  return <TeamManagement team={team} inviteKeys={inviteKeys} />;
}
