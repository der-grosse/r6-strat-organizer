"use client";
import { ConvexClientProvider } from "@/components/context/ConvexClientProvider";
import { FilterProvider } from "@/components/context/FilterContext";
import { Filter } from "@/components/context/FilterContext.functions";
import { UserProvider } from "@/components/context/UserContext";
import { SlotProvider } from "@/components/layout/SlotProvider";
import { ResizeProvider } from "@/components/ui/resize-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

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
          {/* <SocketProvider> */}
          <FilterProvider
            defaultFilter={props.cookieFilter}
            defaultLeading={props.defaultLeading}
          >
            <SlotProvider>
              <ResizeProvider>{props.children}</ResizeProvider>
              <Toaster />
            </SlotProvider>
          </FilterProvider>
          {/* </SocketProvider> */}
        </UserProvider>
      </Authenticated>
      <Unauthenticated>
        <div className="m-4">
          <h2 className="mb-2 text-2xl font-bold">You are not logged in</h2>
          <p className="text-md">
            Please log in to access the application features.
          </p>
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
