"use client";

import { Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Adaptation } from "@/lib/types/strat.types";
import { ADAPTATION_AUTO, ADAPTATION_NONE } from "@/lib/adaptations";

export interface AdaptationSelectorProps {
  adaptations: Adaptation[];
  /** Raw selection: null / "auto" → auto, "none" → base strat, or an adaptation id. */
  selection: string | null;
  /** The adaptation that "auto" currently resolves to, for labelling. */
  autoResolved: Adaptation | null;
  /** When omitted the selector is read-only (e.g. a non-leader following along). */
  onChange?: (selection: string | null) => void;
}

export default function AdaptationSelector({
  adaptations,
  selection,
  autoResolved,
  onChange,
}: AdaptationSelectorProps) {
  const sorted = [...adaptations].sort((a, b) => a.index - b.index);
  const value = selection ?? ADAPTATION_AUTO;

  return (
    <Select
      value={value}
      onValueChange={(next) => onChange?.(next === ADAPTATION_AUTO ? null : next)}
      disabled={!onChange}
    >
      <SelectTrigger
        size="sm"
        className="!h-5 gap-1 border-none bg-transparent px-2 py-0 shadow-none disabled:opacity-100"
      >
        <Layers className="size-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ADAPTATION_AUTO}>
          Auto · {autoResolved ? autoResolved.name || "Unnamed adaptation" : "Base strat"}
        </SelectItem>
        <SelectItem value={ADAPTATION_NONE}>Base strat</SelectItem>
        <SelectSeparator />
        {sorted.map((adaptation) => (
          <SelectItem key={adaptation._id} value={adaptation._id}>
            {adaptation.name || "Unnamed adaptation"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
