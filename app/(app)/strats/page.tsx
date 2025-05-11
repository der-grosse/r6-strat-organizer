"use client";
import { useFilter } from "@/components/context/FilterContext";
import { useUser } from "@/components/context/UserContext";
import { CreateStratDialog } from "@/components/CreateStratDialog";
import { DeleteStratDialog } from "@/components/DeleteStratDialog";
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
import { getGoogleDrawingsEditURL } from "@/src/googleDrawings";
import { setActive } from "@/src/strats";
import { Edit, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StratsPage() {
  const { filteredStrats, isLeading } = useFilter();
  const { user } = useUser();
  const router = useRouter();
  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <CreateStratDialog />
      </div>
      <Table>
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
                <div className="flex gap-1">
                  {strat.powerOPs
                    .map((op) => DEFENDERS.find((o) => o.name === op))
                    .filter(Boolean)
                    .map((op) => (
                      <OperatorIcon key={op!.name} op={op!} />
                    ))}
                </div>
              </TableCell>
              <TableCell className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  onClick={async () => {
                    if (isLeading) {
                      await setActive(user!, strat.id);
                      router.push("/?leading=true");
                    } else {
                      router.push(`/strat/${strat.id}`);
                    }
                  }}
                >
                  <Eye />
                </Button>
                <Link
                  href={`/strats/editor?map=${strat.map}&site=${strat.site}&drawingID=${strat.drawingID}`}
                >
                  <Button
                    variant="outline"
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
