"use client";
import { Fill } from "@/components/layout/Fill";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SquarePlay, ChevronDown, Filter, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function ReplaysLayout({ children }: { children: React.ReactNode }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  return (
    <>
      {children}
      <Fill slot="sidebar-content">
        <Collapsible defaultOpen className="group/strats">
          <SidebarGroup className="pl-0">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="cursor-pointer">
                <SquarePlay className="mr-2" />
                Replays
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/strats:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* filter current replays */}
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Filter />
                      Filter
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </Fill>
      <Fill slot="sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem>
            <input
              type="file"
              className="hidden"
              ref={inputRef}
              onInput={async (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (!files || files.length === 0) return;
                if ([...files].reduce((acc, file) => acc + file.size, 0) > 200 * 1024 * 1024) {
                  alert("Total file size exceeds 200MB");
                  return;
                }

                try {
                  setUploading(true);
                  const formData = new FormData();
                  [...files].forEach((file) => {
                    formData.append("files", file);
                  });
                  // TODO: send to correct endpoint
                  await fetch("/replays/api/upload", {
                    method: "POST",
                    body: formData,
                  });
                } catch (error) {
                  console.error("Error parsing replay files:", error);
                  toast.error("Error uploading replay files");
                } finally {
                  setUploading(false);
                }
              }}
              accept=".rec"
              multiple
            />
            <SidebarMenuButton onClick={() => inputRef.current?.click()} className="relative">
              <Upload />
              Upload replay
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Fill>
    </>
  );
}
