import { getTeamName } from "@/src/auth/team";
import SidebarLayout from "./SidebarLayout";

export default async function SidebarLayoutPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const teamName = await getTeamName();
  if (!teamName) {
    return <div>Error loading team</div>;
  }
  return <SidebarLayout teamName={teamName}>{children}</SidebarLayout>;
}
