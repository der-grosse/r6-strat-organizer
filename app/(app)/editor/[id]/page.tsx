import { StratEditor } from "@/components/StratEditor/StratEditor";
import { getTeam } from "@/src/auth/team";
import { getStrat } from "@/src/strats/strats";
import { CircleX } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const strat = await getStrat(Number(id));

  return {
    title: `${strat?.name} | ${strat?.map} - ${strat?.site}`,
  };
}

export default async function StratEditorPage({
  params: paramsRaw,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const id = Number((await paramsRaw).id);
  const strat = await getStrat(id);
  const team = await getTeam();

  if (!strat) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center">
        <CircleX className="text-destructive" size={64} />
        <h2 className="text-destructive">Strat not found</h2>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <StratEditor team={team} strat={strat} />
    </div>
  );
}
