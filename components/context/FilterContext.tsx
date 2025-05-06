"use client";
import { getAllStrats } from "@/src/strats";
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookie from "js-cookie";
import {
  EMPTY_FILTER,
  Filter,
  FILTER_COOKIE_KEY,
  LEADING_COOKIE_KEY,
} from "./FilterContext.functions";

interface FilterContextType {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
  filteredStrats: Strat[];
  isLeading: boolean;
  setIsLeading: React.Dispatch<React.SetStateAction<boolean>>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{
  children: React.ReactNode;
  defaultFilter?: Filter;
}> = ({ children, defaultFilter }) => {
  const [filter, setFilter] = useState<Filter>(defaultFilter ?? EMPTY_FILTER);

  const [filteredStrats, setFilteredStrats] = useState<Strat[]>([]);

  const [isLeading, setIsLeading] = useState(
    Cookie.get(FILTER_COOKIE_KEY) === "true"
  );

  // store filter in cookies
  useEffect(() => {
    Cookie.set(FILTER_COOKIE_KEY, JSON.stringify(filter));
  }, [filter]);

  // load filtered strats based on filter
  useEffect(() => {
    let stop = false;
    (async () => {
      const strats = await getAllStrats();
      if (stop) return;
      const filtered = strats.filter((strat) => {
        if (filter.map && filter.map !== strat.map) return false;
        if (filter.site && filter.site !== strat.site) return false;
        if (filter.bannedOPs.length > 0) {
          const hasBannedOP = strat.powerOPs.some((op) =>
            filter.bannedOPs.includes(op)
          );
          if (hasBannedOP) return false;
        }
        return true;
      });
      setFilteredStrats(filtered);
    })();

    return () => {
      stop = true;
    };
  }, [filter]);

  useEffect(() => {
    Cookie.set(LEADING_COOKIE_KEY, isLeading.toString());
  }, [isLeading]);

  return (
    <FilterContext.Provider
      value={{ filter, setFilter, filteredStrats, isLeading, setIsLeading }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};
