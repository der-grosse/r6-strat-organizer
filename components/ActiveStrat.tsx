"use client";
import { getActive } from "@/src/strats/strats";
import { useEffect, useState } from "react";
import StratDisplay from "./StratDisplay";

export interface ActiveStratProps {
  defaultOpen?: Strat | null;
}

export default function ActiveStrat(props: ActiveStratProps) {
  const [strat, setStrat] = useState<Strat | null>(props.defaultOpen ?? null);

  useEffect(() => {
    let stop = false;

    (async () => {
      while (!stop) {
        const current = await getActive();
        if (stop) return;
        if (current) {
          document.title = `Current Strat | ${current.name} | ${current.site}`;
          setStrat(current);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    })();

    return () => {
      stop = true;
    };
  }, [setStrat]);

  return <StratDisplay strat={strat} />;
}
