"use client";
import { useEffect } from "react";
import StratDisplay from "./StratDisplay";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface ActiveStratProps {
  initialViewModifier?: "none" | "hideForeign" | "grayscaleForeign";
}

export default function ActiveStrat(props: ActiveStratProps) {
  const team = useQuery(api.team.get);
  const activeStrat = useQuery(api.activeStrat.get);

  useEffect(() => {
    if (!activeStrat) {
      document.title = "Current strat";
    } else {
      document.title = `Current strat | ${activeStrat.name} | ${activeStrat.map} - ${activeStrat.site}`;
    }
  }, [activeStrat]);

  if (!team) {
    return null;
  }

  return (
    <StratDisplay
      strat={activeStrat}
      team={team}
      initialViewModifier={props.initialViewModifier}
    />
  );
}
