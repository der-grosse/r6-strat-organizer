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
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReactNode } from "react";

interface DeleteStratDialogProps {
  stratID: Id<"strats">;
  stratName: string;
  trigger?: ReactNode;
}

export function DeleteStratDialog({
  stratID,
  stratName,
  trigger,
}: Readonly<DeleteStratDialogProps>) {
  const archiveStrat = useMutation(api.strats.archive);

  const [open, setOpen] = useState(false);

  async function handleDelete() {
    try {
      const result = await archiveStrat({ stratID });

      if (!result.success) {
        throw new Error(result.error);
      }

      setOpen(false);
      toast.success("Strat deleted successfully");
    } catch (error) {
      console.error("Error deleting strat:", error);
      toast.error("Failed to delete strat");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
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
