"use server";

import { cookies } from "next/headers";
import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getJWT } from "@/server/jwt";
import StratViewClient from "./page.client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string[] }>;
}): Promise<Metadata> {
  const { id } = await params;
  const strat = await fetchQuery(
    api.strats.get,
    { id: id[0] as Id<"strats"> },
    { token: await getJWT() },
  ).catch(() => null);

  if (!strat) {
    return {
      title: "Strat not found",
      description: "The requested strat could not be found.",
    };
  }

  return {
    title: `${strat.name} | ${strat.map} - ${strat.site}`,
    description: `${strat.map} | ${strat.site}`,
  };
}

export default async function StratView({
  params: paramsRaw,
}: Readonly<{
  params: Promise<{ id: string[] }>;
}>) {
  const params = (await paramsRaw).id;
  const id = params[0];

  const editView = params[1] === "edit";

  return <StratViewClient id={id} editView={editView} />;
}
