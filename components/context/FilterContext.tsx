"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  defaultLeading?: boolean;
  allStrats?: Strat[];
}> = ({ allStrats, children, defaultFilter, defaultLeading }) => {
  const [filter, setFilter] = useState<Filter>(defaultFilter ?? EMPTY_FILTER);

  const [isLeading, setIsLeading] = useState(
    defaultLeading ?? Cookie.get(LEADING_COOKIE_KEY) === "true"
  );

  const filteredStrats = useMemo(
    () =>
      allStrats?.filter((strat) => {
        if (filter.map && filter.map !== strat.map) return false;
        if (filter.site && filter.site !== strat.site) return false;
        if (filter.bannedOPs.length > 0) {
          const hasBannedOP = strat.powerOPs.some((op) =>
            filter.bannedOPs.includes(op)
          );
          if (hasBannedOP) return false;
        }
        return true;
      }) ?? [],
    [allStrats, filter]
  );

  // store filter in cookies
  useEffect(() => {
    Cookie.set(FILTER_COOKIE_KEY, JSON.stringify(filter));
  }, [filter]);
  useEffect(() => {
    Cookie.set(LEADING_COOKIE_KEY, isLeading.toString());
  }, [isLeading]);

  return (
    <FilterContext.Provider
      value={{
        filter,
        setFilter,
        filteredStrats,
        isLeading,
        setIsLeading,
      }}
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
