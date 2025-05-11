import ActiveStrat from "@/components/ActiveStrat";
import { getActive } from "@/src/strats";

export default async function Home() {
  const active = await getActive();

  return <ActiveStrat defaultOpen={active} />;
}
