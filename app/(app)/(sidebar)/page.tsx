import ActiveStrat from "@/components/ActiveStrat";
import { getTeam } from "@/src/auth/team";
import { getActive } from "@/src/strats/strats";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Current Strat",
};

export default async function Home() {
  const active = await getActive();
  const team = await getTeam();

  return <ActiveStrat defaultOpen={active} team={team} />;
}
