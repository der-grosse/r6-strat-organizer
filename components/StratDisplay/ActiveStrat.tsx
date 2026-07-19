"use client";
import { useEffect } from "react";
import StratDisplay from "./StratDisplay";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFilter } from "../context/FilterContext";

export default function ActiveStrat() {
  const team = useQuery(api.team.get);
  const activeStrat = useQuery(api.activeStrat.get);
  const adaptationSelection = useQuery(api.activeStrat.getAdaptationSelection);
  const setAdaptation = useMutation(api.activeStrat.setAdaptation);
  const { isLeading } = useFilter();

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
      adaptationSelection={adaptationSelection ?? null}
      // Only the leader controls the team-synced adaptation; others follow along.
      onAdaptationSelectionChange={
        isLeading ? (selection) => setAdaptation({ selection }) : undefined
      }
    />
  );
}
