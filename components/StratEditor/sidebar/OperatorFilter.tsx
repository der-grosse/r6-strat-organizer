import OperatorPicker from "@/components/general/OperatorPicker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SidebarLabeledToggle from "@/components/ui/sidebarLabeledToggle";
import { Strat } from "@/lib/types/strat.types";
import { ChessRook, ChevronDown, Swords } from "lucide-react";

type Filter = NonNullable<Strat["filters"]>["defenders"];

export interface OperatorFilterProps {
  filter: Filter;
  onChange: (newFilter: Filter) => void;
  type: "attackers" | "defenders";
}

const DEFAULT_FILTER = {
  triggerOn: "banned",
  action: "show",
  filterType: "all",
  operators: [],
} satisfies Filter;

const SLOT_STYLES = {
  button: {
    className: "px-2 flex-1",
  },
  buttonGroup: {
    className: "w-full",
  },
};

export default function OperatorFilter(props: OperatorFilterProps) {
  return (
    <Collapsible className="rounded-md border bg-muted/50 py-1">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="group flex w-full items-center justify-between gap-2 !px-2 text-muted-foreground hover:bg-muted/70"
        >
          <span className="flex items-center gap-1 text-sm">
            {props.type === "attackers" ? (
              <Swords className="h-4 w-4" />
            ) : (
              <ChessRook className="h-4 w-4" />
            )}
            {props.type === "attackers" ? "Attacker" : "Defender"} Filter
            {props.filter && props.filter.operators.length > 0 && (
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
          active={props.filter?.triggerOn === "banned"}
          onChange={(toggled) => {
            props.onChange({
              ...DEFAULT_FILTER,
              ...props.filter,
              triggerOn: toggled ? "banned" : "available",
            });
          }}
          slots={SLOT_STYLES}
        />
        <SidebarLabeledToggle
          label="Action when triggered"
          labels={["hide", "show"]}
          active={props.filter?.action === "hide"}
          onChange={(toggled) => {
            props.onChange({
              ...DEFAULT_FILTER,
              ...props.filter,
              action: toggled ? "hide" : "show",
            });
          }}
          slots={SLOT_STYLES}
        />
        <SidebarLabeledToggle
          label="Match if any or all ops banned"
          labels={["any", "all"]}
          active={props.filter?.filterType === "any"}
          onChange={(toggled) => {
            props.onChange({
              ...DEFAULT_FILTER,
              ...props.filter,
              filterType: toggled ? "any" : "all",
            });
          }}
          slots={SLOT_STYLES}
        />
        <Label className="text-muted-foreground p-1">Operators</Label>
        <OperatorPicker
          side={props.type === "attackers" ? "attacker" : "defender"}
          selected={props.filter?.operators ?? []}
          multiple
          trigger={({ children, ...rest }) => (
            <Button {...rest} variant="secondary" className="w-full">
              {props.filter?.operators?.length
                ? children
                : `Select ${props.type === "attackers" ? "Attackers" : "Defenders"}`}
            </Button>
          )}
          onChange={(operators) => {
            props.onChange({
              ...DEFAULT_FILTER,
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
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => props.onChange({ ...DEFAULT_FILTER })}
        >
          Clear Filter
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

function stringifyFilter(filter: Filter) {
  if (!filter?.operators.length) {
    return "No filter set";
  }
  return `If ${filter.filterType} selected operator${filter.filterType === "all" ? "s are" : " is"} ${filter.triggerOn}, this strat is ${filter.action === "hide" ? "hidden" : "shown"}`;
}
