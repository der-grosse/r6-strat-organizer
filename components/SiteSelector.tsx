import { ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import MAPS from "@/src/static/maps";

export interface SiteSelectorProps {
  map: string | null;
  site: string | null;
  onChange: (site: string | null) => void;
  trigger: React.FC<{ children: React.ReactNode }>;
  hideEmpty?: boolean;
}

export default function SiteSelector(props: SiteSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!props.map}>
        <props.trigger>
          {props.site ?? (props.map ? "Select site" : "Select map first")}
          <ChevronRight className="ml-auto" />
        </props.trigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-56">
        {!props.hideEmpty && (
          <DropdownMenuItem key="clear" onClick={() => props.onChange(null)}>
            <em>Clear</em>
          </DropdownMenuItem>
        )}
        {MAPS.find((map) => map.name === props.map)?.sites.map((site) => (
          <DropdownMenuItem key={site} onClick={() => props.onChange(site)}>
            {site}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
