import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export interface Filter {
  map: string | null;
  site: string | null;
  bannedOPs: string[];
}

export const EMPTY_FILTER: Filter = {
  map: null,
  site: null,
  bannedOPs: [],
};
export const FILTER_COOKIE_KEY = "strat_filter";
export const LEADING_COOKIE_KEY = "strat_leading";

export function parseCookies(cookies: ReadonlyRequestCookies) {
  const storedFilter = cookies.get(FILTER_COOKIE_KEY)?.value;
  return storedFilter
    ? { ...EMPTY_FILTER, ...JSON.parse(storedFilter) }
    : EMPTY_FILTER;
}
