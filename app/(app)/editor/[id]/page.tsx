import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getJWT } from "@/server/jwt";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import StratEditorClient from "./page.client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const strat = await fetchQuery(
    api.strats.get,
    { id: id as Id<"strats"> },
    { token: await getJWT() },
  );

  if (!strat) {
    return {
      title: "Strat not found",
    };
  }

  return {
    title: `${strat.name} | ${strat.map} - ${strat.site}`,
  };
}

export default async function StratEditorPage({
  params: paramsRaw,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const id = (await paramsRaw).id;

  return <StratEditorClient id={id} />;
}
