import { getTeam } from "@/src/auth/team";
import SidebarLayout from "./SidebarLayout";

export default async function SidebarLayoutPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const team = await getTeam();
  return <SidebarLayout team={team}>{children}</SidebarLayout>;
}
