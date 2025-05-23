"use client";
import { useFilter } from "@/components/context/FilterContext";
import { CreateStratDialog } from "@/components/CreateStratDialog";
import { DeleteStratDialog } from "@/app/(app)/(sidebar)/strats/DeleteStratDialog";
import OperatorIcon from "@/components/OperatorIcon";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFENDERS } from "@/src/static/operator";
import { setActive } from "@/src/strats/strats";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import config from "@/src/static/config";

export default function StratsPage() {
  const { filteredStrats, isLeading } = useFilter();
  return (
    <div className="w-full h-full p-4 flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-1 items-center">
        <div />
        <p className="text-center text-muted-foreground leading-none">
          All Strats
          <br />
          <span className="text-xs leading-none">
            (total {filteredStrats.length})
          </span>
        </p>
        <div className="flex justify-end">
          {!config.disabledFeatures.includes("create-strat") && (
            <CreateStratDialog />
          )}
        </div>
      </div>
      <Table className="mb-2">
        {/* mb-2 needed to prevent overflow of table component due to -my-2 used in table cells */}
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Map</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Power OPs</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStrats.map((strat) => (
            <TableRow key={strat.id}>
              <TableCell>{strat.rotationIndex?.join(", ")}</TableCell>
              <TableCell>{strat.map}</TableCell>
              <TableCell>{strat.site}</TableCell>
              <TableCell>{strat.name}</TableCell>
              <TableCell>
                <div className="flex gap-1 -my-2">
                  {strat.operators
                    .filter((o) => o.isPowerOP)
                    .map((op) => DEFENDERS.find((o) => o.name === op.operator))
                    .filter(Boolean)
                    .map((op) => (
                      <OperatorIcon key={op!.name} op={op!} />
                    ))}
                </div>
              </TableCell>
              <TableCell className="flex gap-1 -my-2">
                <Link href={isLeading ? "/" : `/strat/${strat.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={async () => {
                      if (isLeading) {
                        await setActive(strat.id);
                      }
                    }}
                  >
                    <Eye />
                  </Button>
                </Link>
                <Link href={`/editor/${strat.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Pencil />
                  </Button>
                </Link>
                <DeleteStratDialog stratId={strat.id} stratName={strat.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
