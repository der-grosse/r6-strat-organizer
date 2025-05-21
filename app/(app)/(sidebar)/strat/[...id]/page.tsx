import StratDisplay from "@/components/StratDisplay";
import { getStrat } from "@/src/strats/strats";

export default async function Page({
  params: paramsRaw,
}: Readonly<{
  params: Promise<{ id: string[] }>;
}>) {
  const params = (await paramsRaw).id;
  const id = Number(params[0]);
  const strat = await getStrat(id);

  const editView = params[1] === "edit";

  if (!strat) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-2xl font-bold text-center">
          Strat not found (id: {id})
          <br />
          <span className="text-sm font-mono">{JSON.stringify(params)}</span>
        </p>
      </div>
    );
  }

  return <StratDisplay strat={strat} editView={editView} />;
}
