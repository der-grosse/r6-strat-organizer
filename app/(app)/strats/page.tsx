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
import StratsDB from "@/src/db";
import { Edit, Eye } from "lucide-react";
import Link from "next/link";

export default async function StratsPage() {
  const strats = StratsDB.list();
  return (
    <div className="w-full p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Map</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Power OPs</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strats.map((strat) => (
            <TableRow key={strat.id}>
              <TableCell>{strat.map}</TableCell>
              <TableCell>{strat.site}</TableCell>
              <TableCell>{strat.name}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {strat.powerOPs
                    .map((op) => DEFENDERS.find((o) => o.name === op))
                    .filter(Boolean)
                    .map((op) => (
                      <OperatorIcon op={op!} />
                    ))}
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={strat.previewURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Eye />
                  </Button>
                </Link>
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
