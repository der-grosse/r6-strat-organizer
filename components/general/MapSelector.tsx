import { ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import MAPS from "@/lib/static/maps";
import { R6Map } from "@/lib/types/strat.types";

export interface MapSelectorProps {
  map: string | undefined;
  onChange: (map: R6Map | undefined) => void;
  trigger: React.FC<{ children: React.ReactNode }>;
  hideEmpty?: boolean;
}

export default function MapSelector(props: MapSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <props.trigger>
          {props.map ?? "Select map"}
          <ChevronRight className="ml-auto" />
        </props.trigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-56">
        {!props.hideEmpty && (
          <DropdownMenuItem key="clear" onClick={() => props.onChange(undefined)}>
            <em>Clear</em>
          </DropdownMenuItem>
        )}
        {MAPS.map((map) => (
          <DropdownMenuItem key={map.name} onClick={() => props.onChange(map)}>
            {map.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
