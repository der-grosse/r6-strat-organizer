import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export interface Filter {
  map: string | undefined;
  site: string | undefined;
}

export const EMPTY_FILTER: Filter = {
  map: undefined,
  site: undefined,
};
export const FILTER_COOKIE_KEY = "strat_filter";
export const LEADING_COOKIE_KEY = "strat_leading";

export function parseCookies(cookies: ReadonlyRequestCookies) {
  const storedFilter = cookies.get(FILTER_COOKIE_KEY)?.value;
  return storedFilter ? { ...EMPTY_FILTER, ...JSON.parse(storedFilter) } : EMPTY_FILTER;
}
