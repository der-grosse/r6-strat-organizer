"use client";
import { FilterProvider } from "@/components/context/FilterContext";
import { Filter } from "@/components/context/FilterContext.functions";
import { UserProvider } from "@/components/context/UserContext";
import { Toaster } from "@/components/ui/sonner";

export interface ProvidersProps {
  children: React.ReactNode;
  cookieFilter?: Filter;
  jwt?: string;
  defaultLeading?: boolean;
}

export default function Providers(props: Readonly<ProvidersProps>) {
  return (
    <UserProvider jwt={props.jwt}>
      <FilterProvider
        defaultFilter={props.cookieFilter}
        defaultLeading={props.defaultLeading}
      >
        {props.children}
        <Toaster />
      </FilterProvider>
    </UserProvider>
  );
}
