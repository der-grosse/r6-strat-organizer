"use client";
import StratEditorSidebar, { StratEditorSidebarProps } from "./sidebar/Sidebar";

export default function StratEditorLayout({
  children,
  ...props
}: Readonly<
  {
    children: React.ReactNode;
  } & StratEditorSidebarProps
>) {
  return (
    <div className="h-screen w-screen overflow-hidden grid grid-cols-[auto_1fr] lg:grid-cols-[1fr_4fr]">
      <StratEditorSidebar {...props} />

      {/* Canvas */}
      <div className="flex-1 relative h-screen overflow-hidden py-0 block">
        <div className="relative h-full w-full flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}
