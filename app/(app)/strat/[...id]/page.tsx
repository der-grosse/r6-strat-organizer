import StratDisplay from "@/components/StratDisplay";
import { getStrat } from "@/src/strats";

export default async function Page({
  params: paramsRaw,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const params = (await paramsRaw).id.slice(1);
  const id = Number(params[0]);
  const strat = await getStrat(id);

  const editView = params[1] === "edit" ? true : false;

  if (!strat) {
    return (
      <p>
        Strat not found (id: {id}, edit: {editView}, params: {params.join(", ")}
        )
      </p>
    );
  }

  return <StratDisplay strat={strat} editView={editView} />;
}
