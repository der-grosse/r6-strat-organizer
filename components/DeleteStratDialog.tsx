"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteStrat } from "@/src/actions/strats";
import { toast } from "sonner";
import { useFilter } from "@/components/context/FilterContext";

interface DeleteStratDialogProps {
  stratId: number;
  stratName: string;
}

export function DeleteStratDialog({
  stratId,
  stratName,
}: Readonly<DeleteStratDialogProps>) {
  const [open, setOpen] = useState(false);
  const { refreshStrats } = useFilter();

  async function handleDelete() {
    try {
      const result = await deleteStrat(stratId);

      if (!result.success) {
        throw new Error(result.error);
      }

      setOpen(false);
      await refreshStrats();
      toast.success("Strat deleted successfully");
    } catch (error) {
      console.error("Error deleting strat:", error);
      toast.error("Failed to delete strat");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="cursor-pointer">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Strat</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the strat "{stratName}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
