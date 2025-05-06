import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "../globals.css";
import AppLayout from "@/components/AppLayout";
import { cookies } from "next/headers";
import { parseCookies } from "@/components/context/FilterContext.functions";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "R6 Strats",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();
  const filter = parseCookies(cookiesStore);
  const jwt = cookiesStore.get("jwt")?.value;
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${notoSans.variable} antialiased m-0 dark w-screen min-h-screen`}
      >
        <AppLayout cookieFilter={filter} jwt={jwt}>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
