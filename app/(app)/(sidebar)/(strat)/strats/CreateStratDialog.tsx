"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import MAPS from "@/lib/static/maps";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { extractDrawingID } from "@/lib/googleDrawings";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  map: z.string().min(1, "Map is required"),
  site: z.string().min(1, "Site is required"),
  name: z.string().optional(),
  description: z.string().optional(),
  drawingID: z.string().min(1, "Drawing ID is required").nullable(),
});

export function CreateStratDialog() {
  const router = useRouter();
  const createStrat = useMutation(api.strats.create);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      map: "",
      site: "",
      name: "",
      description: "",
      drawingID: null,
    },
  });

  const selectedMap = form.watch("map");
  const selectedSites = MAPS.find((map) => map.name === selectedMap)?.sites ?? [];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const drawingID = extractDrawingID(values.drawingID);
      const result = await createStrat({
        name: "",
        description: "",
        ...values,
        drawingID,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setOpen(false);
      form.reset();
      router.push(`/editor/${result.stratID}`);
    } catch (error) {
      console.error("Error creating strat:", error);
      toast.error("Failed to create strat");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Strat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Strat</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="map"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Map</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a map" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MAPS.map((map) => (
                        <SelectItem key={map.name} value={map.name}>
                          {map.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="site"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedMap}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={selectedMap ? "Select a site" : "Select a map first"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedSites.map((site) => (
                        <SelectItem key={site} value={site}>
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter strat name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter strat description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="drawingID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <em>Drawing ID</em>
                    <Tooltip delayDuration={750}>
                      <TooltipTrigger>
                        <Info className="size-4 " />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-sm">
                          When you supply a drawing ID, the strat will load from Google Drawings. If
                          not, you can use the Beta built in strat editor.
                          <br />
                          You can paste the whole link to your Google Drawing Link or the extracted
                          ID from the link.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Google Drawing ID"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Create Strat
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
