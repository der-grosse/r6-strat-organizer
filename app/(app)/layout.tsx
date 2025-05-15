import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import AppLayout from "@/components/AppLayout";
import { cookies } from "next/headers";
import {
  LEADING_COOKIE_KEY,
  parseCookies,
} from "@/components/context/FilterContext.functions";
import favicon from "@/public/favicon.ico";
import "../globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "R6 Strats",
  icons: {
    icon: favicon.src,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();
  const filter = parseCookies(cookiesStore);
  const jwt = cookiesStore.get("jwt")?.value;
  const leading = cookiesStore.get(LEADING_COOKIE_KEY)?.value === "true";
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${notoSans.variable} antialiased m-0 dark w-screen min-h-screen`}
      >
        <AppLayout cookieFilter={filter} jwt={jwt} defaultLeading={leading}>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
