"use client";
import { useFilter } from "@/components/FilterContext";
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
import DEFENDERS from "@/data/operator";
import { setActive } from "@/src/strats";
import { Edit, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StratsPage() {
  const { filteredStrats, isLeading } = useFilter();
  const router = useRouter();
  return (
    <div className="w-full p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Map</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Power OPs</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Edit</TableHead>
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
                <div className="flex gap-1">
                  {strat.powerOPs
                    .map((op) => DEFENDERS.find((o) => o.name === op))
                    .filter(Boolean)
                    .map((op) => (
                      <OperatorIcon key={op!.name} op={op!} />
                    ))}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  onClick={async () => {
                    if (isLeading) {
                      await setActive(strat);
                      router.push("/?leading=true");
                    } else {
                      router.push(`/strat/${strat.id}`);
                    }
                  }}
                >
                  <Eye />
                </Button>
              </TableCell>
              <TableCell>
                <Link
                  href={strat.editURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Edit />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
