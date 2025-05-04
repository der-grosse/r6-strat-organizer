import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StratsDB from "@/src/db";
import { Edit } from "lucide-react";
import Link from "next/link";

export default async function StratsPage() {
  const strats = StratsDB.list();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Map</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Name</TableHead>
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
              <Link
                href={strat.previewURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full cursor-pointer">
                  Preview
                </Button>
              </Link>
            </TableCell>
            <TableCell>
              <Link
                href={strat.editURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full cursor-pointer">
                  <Edit />
                  Edit
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
