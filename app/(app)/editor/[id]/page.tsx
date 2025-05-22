import { StratEditor } from "@/components/StratEditor/StratEditor";
import { getTeamMembers } from "@/src/auth/team";
import { getStrat } from "@/src/strats/strats";
import { CircleX } from "lucide-react";

export default async function StratEditorPage({
  params: paramsRaw,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const id = Number((await paramsRaw).id);
  const strat = await getStrat(id);
  const teamMembers = await getTeamMembers();

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
      <StratEditor
        teamMembers={teamMembers}
        strat={{
          assets: [],
          operators: [],
          ...strat,
        }}
      />
    </div>
  );
}
