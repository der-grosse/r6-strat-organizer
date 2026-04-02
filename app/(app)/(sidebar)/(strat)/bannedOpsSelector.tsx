import { useFilter } from "@/components/context/FilterContext";
import OperatorPicker from "@/components/general/OperatorPicker";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export default function BannedOpsSelector() {
  const bannedOps = useQuery(api.bannedOps.get) || [];
  const setBannedOps = useMutation(api.bannedOps.set);
  const { isLeading } = useFilter();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <OperatorPicker
            disabled={!isLeading}
            multiple
            selected={bannedOps}
            onChange={(bannedOps) => setBannedOps({ operators: bannedOps })}
            trigger={SidebarMenuButton}
            modal={true}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p className="text-sm">Select operators to ban</p>
        <p className="text-xs text-muted-foreground">
          Can only be selected while leading active strat
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
