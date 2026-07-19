import OperatorPicker from "@/components/general/OperatorPicker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SidebarLabeledToggle from "@/components/ui/sidebarLabeledToggle";
import { AdaptationFilter as AdaptationFilterType } from "@/lib/types/strat.types";
import { ChessRook, ChevronDown, Funnel, Swords } from "lucide-react";
import { ATTACKERS, DEFENDERS } from "@/lib/static/operator";

export interface AdaptationFilterProps {
  filter: AdaptationFilterType;
  index: number;
  onChange: (newFilter: AdaptationFilterType) => void;
  onRemove: () => void;
}

export const DEFAULT_ADAPTATION_FILTER = {
  triggerOn: "banned",
  filterType: "all",
  operators: [],
} satisfies AdaptationFilterType;

const SLOT_STYLES = {
  button: {
    className: "px-2 flex-1",
  },
  buttonGroup: {
    className: "w-full",
  },
};

function FilterIcon({ filter }: { filter: AdaptationFilterType }) {
  if (!filter.operators.length) {
    return <Funnel className="h-4 w-4" />;
  }
  if (filter.operators.every((op) => DEFENDERS.some((def) => def.name === op))) {
    return <ChessRook className="h-4 w-4" />;
  }
  if (filter.operators.every((op) => ATTACKERS.some((def) => def.name === op))) {
    return <Swords className="h-4 w-4" />;
  }
  return <Funnel className="h-4 w-4" />;
}

export default function AdaptationFilter(props: AdaptationFilterProps) {
  return (
    <Collapsible className="rounded-md border bg-muted/50 py-1">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="group flex w-full items-center justify-between gap-2 px-2! text-muted-foreground hover:bg-muted/70"
        >
          <span className="flex items-center gap-1 text-sm">
            <FilterIcon filter={props.filter} />
            Filter {props.index + 1}
            {props.filter.operators.length > 0 && (
              <span className="text-xs text-muted-foreground">(active)</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2 px-1">
        <Separator className="-mt-1" orientation="horizontal" />
        <SidebarLabeledToggle
          label="Trigger on ops"
          labels={["banned", "available"]}
          active={props.filter.triggerOn === "banned"}
          onChange={(toggled) => {
            props.onChange({
              ...props.filter,
              triggerOn: toggled ? "banned" : "available",
            });
          }}
          slots={SLOT_STYLES}
        />
        <SidebarLabeledToggle
          label="Match if any or all ops"
          labels={["any", "all"]}
          active={props.filter.filterType === "any"}
          onChange={(toggled) => {
            props.onChange({
              ...props.filter,
              filterType: toggled ? "any" : "all",
            });
          }}
          slots={SLOT_STYLES}
        />
        <Label className="text-muted-foreground p-1">Operators</Label>
        <OperatorPicker
          side="both"
          selected={props.filter.operators}
          multiple
          trigger={({ children, ...rest }) => (
            <Button {...rest} variant="secondary" className="w-full">
              {props.filter.operators.length ? children : "Select Operators"}
            </Button>
          )}
          onChange={(operators) => {
            props.onChange({
              ...props.filter,
              operators,
            });
          }}
        />
        <Separator orientation="horizontal" />
        <span className="text-muted-foreground text-sm text-text p-1">
          <em>{stringifyFilter(props.filter)}</em>
        </span>
        <Separator orientation="horizontal" className="mt-2" />
        <Button variant="ghost" size="sm" className="w-full" onClick={props.onRemove}>
          Remove Filter
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

function stringifyFilter(filter: AdaptationFilterType) {
  if (!filter.operators.length) {
    return "No filter set";
  }
  return `If ${filter.filterType} selected operator${
    filter.filterType === "all" ? "s are" : " is"
  } ${filter.triggerOn}, this adaptation activates`;
}
