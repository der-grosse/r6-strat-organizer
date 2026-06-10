import type { Metadata } from "next";
import favicon from "@/public/favicon.ico";
import "./globals.css";

export const metadata: Metadata = {
  title: "R6 Strats",
  description: "Plan and organize your Rainbow Six Siege strategies - R6 Strat Organizer Tool",
  icons: {
    icon: favicon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* mobile debugger */}
      {/* <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
      <script>eruda.init();</script> */}
      <body className="antialiased m-0 dark w-screen min-h-screen">{children}</body>
    </html>
  );
}
