import { cookies } from "next/headers";
import {
  LEADING_COOKIE_KEY,
  parseCookies,
} from "@/components/context/FilterContext.functions";
import Providers from "./Providers";
import { getAllStrats } from "@/src/strats/strats";

export default async function ProvidersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();
  const filter = parseCookies(cookiesStore);
  const jwt = cookiesStore.get("jwt")?.value;
  const leading = cookiesStore.get(LEADING_COOKIE_KEY)?.value === "true";
  const allStrats = await getAllStrats();
  return (
    <Providers
      cookieFilter={filter}
      jwt={jwt}
      defaultLeading={leading}
      allStrats={allStrats}
    >
      {children}
    </Providers>
  );
}
