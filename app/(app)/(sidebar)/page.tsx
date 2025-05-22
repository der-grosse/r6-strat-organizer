import ActiveStrat from "@/components/ActiveStrat";
import { getActive } from "@/src/strats/strats";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Current Strat",
};

export default async function Home() {
  const active = await getActive();

  return <ActiveStrat defaultOpen={active} />;
}
