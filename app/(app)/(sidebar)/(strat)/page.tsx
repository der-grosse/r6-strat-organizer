import ActiveStrat from "@/components/StratDisplay/ActiveStrat";
import { api } from "@/convex/_generated/api";
import { getJWT } from "@/server/jwt";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const active = await fetchQuery(
    api.activeStrat.get,
    {},
    {
      token: await getJWT(),
    },
  );

  return {
    title: `Current strat${active ? ` | ${active?.name} | ${active?.map} - ${active?.site}` : ""}`,
    description: "View the currently active strat",
  };
}

export default async function Home() {
  return <ActiveStrat />;
}
