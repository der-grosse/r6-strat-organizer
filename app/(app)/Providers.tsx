"use client";
import { ConvexClientProvider } from "@/components/context/ConvexClientProvider";
import { FilterProvider } from "@/components/context/FilterContext";
import { Filter } from "@/components/context/FilterContext.functions";
import { UserProvider } from "@/components/context/UserContext";
import { SlotProvider } from "@/components/layout/SlotProvider";
import { StratExportProvider } from "@/components/StratEditor/ExportRenderer";
import { Button } from "@/components/ui/button";
import { ResizeProvider } from "@/components/ui/resize-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { logout } from "@/server/auth";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";

export interface ProvidersProps {
  children: React.ReactNode;
  cookieFilter?: Filter;
  jwt?: string;
  defaultLeading?: boolean;
}

export default function Providers(props: Readonly<ProvidersProps>) {
  return (
    <ConvexClientProvider>
      <Authenticated>
        <UserProvider jwt={props.jwt}>
          <FilterProvider defaultFilter={props.cookieFilter} defaultLeading={props.defaultLeading}>
            <SlotProvider>
              <ResizeProvider>
                <StratExportProvider>{props.children}</StratExportProvider>
              </ResizeProvider>
              <Toaster />
            </SlotProvider>
          </FilterProvider>
        </UserProvider>
      </Authenticated>
      <Unauthenticated>
        <div className="m-4">
          <h2 className="mb-2 text-2xl font-bold">You are not logged in</h2>
          <p className="text-md">Please log in to access the app.</p>
          <Link href="/login">
            <Button
              className="mt-4"
              onClick={async () => {
                await logout();
              }}
            >
              Log In
            </Button>
          </Link>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="m-4">
          <Skeleton className="w-full h-full" />
        </div>
      </AuthLoading>
    </ConvexClientProvider>
  );
}
