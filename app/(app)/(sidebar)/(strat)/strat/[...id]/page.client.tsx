"use client";

import StratDisplay from "@/components/StratDisplay/StratDisplay";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ADAPTATION_AUTO } from "@/lib/adaptations";
import { useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

export interface StratViewClientProps {
  id: string;
  editView: boolean;
}

export default function StratViewClient(props: StratViewClientProps) {
  return (
    <Suspense>
      <StratView {...props} />
    </Suspense>
  );
}

function StratView(props: StratViewClientProps) {
  const strat = useQuery(api.strats.get, { id: props.id as Id<"strats"> });
  const team = useQuery(api.team.get, {});

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const adaptationSelection = searchParams.get("adaptation");

  const setAdaptationSelection = useCallback(
    (selection: string | null) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (!selection || selection === ADAPTATION_AUTO) {
        params.delete("adaptation");
      } else {
        params.set("adaptation", selection);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  if (!team || strat === undefined) return null;

  if (strat === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-2xl font-bold text-center">Strat not found (id: {props.id})</p>
      </div>
    );
  }

  return (
    <StratDisplay
      strat={strat}
      team={team}
      editView={props.editView}
      adaptationSelection={adaptationSelection}
      onAdaptationSelectionChange={setAdaptationSelection}
    />
  );
}
