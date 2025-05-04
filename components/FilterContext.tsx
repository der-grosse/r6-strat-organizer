"use client";
import { getAllStrats } from "@/src/strats";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Filter {
  map: string | null;
  site: string | null;
  bannedOPs: string[];
}

const EMPTY_FILTER: Filter = {
  map: null,
  site: null,
  bannedOPs: [],
};

interface FilterContextType {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
  filteredStrats: Strat[];
  isLeading: boolean;
  setIsLeading: React.Dispatch<React.SetStateAction<boolean>>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const FILTER_STORAGE_KEY = "strat_filter";

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filter, setFilter] = useState<Filter>(() => {
    if (typeof window !== "undefined") {
      const storedFilter = localStorage.getItem(FILTER_STORAGE_KEY);
      return storedFilter
        ? { ...EMPTY_FILTER, ...JSON.parse(storedFilter) }
        : EMPTY_FILTER;
    }
    return EMPTY_FILTER;
  });

  const [filteredStrats, setFilteredStrats] = useState<Strat[]>([]);

  const [isLeading, setIsLeading] = useState(false);

  // store filter in local storage
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filter));
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
