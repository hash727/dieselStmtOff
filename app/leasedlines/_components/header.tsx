// app/leasedline/_components/header.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Menu, Search, Wifi } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LeasedLineSidebar } from "./sidebar";

export function LeasedLineHeader() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((item) => item !== "");

  return (
    <header className="flex w-full items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Left Side: Mobile Menu + Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <LeasedLineSidebar isMobile />
            </SheetContent>
          </Sheet>
        </div>

        {/* Breadcrumb Logic */}
        <nav className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {pathSegments.map((segment, index) => {
            const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
            const isLast = index === pathSegments.length - 1;

            return (
              <div key={href} className="flex items-center">
                <ChevronRight className="h-3 w-3 mx-2 opacity-50" />
                <Link
                  href={href}
                  className={isLast ? "text-slate-900 dark:text-zinc-100" : "hover:text-blue-600 transition-colors"}
                >
                  {segment.replace(/-/g, " ")}
                </Link>
              </div>
            );
          })}
        </nav>

        
      </div>
      <div className="hidden lg:flex items-center relative max-w-md w-full mx-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
                type="text"
                placeholder="Quick Find: IP, Site ID or Circuit..."
                className="w-full bg-slate-100 dark:bg-zinc-900 border-none rounded-full py-2 pl-10 pr-4 text-[11px] font-bold uppercase tracking-wider focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-block h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
            </kbd>
        </div>

      {/* Right Side: Network Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
        <Wifi className="h-3.5 w-3.5 text-blue-600" />
        <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400">Active Node: GW-01</span>
      </div>
    </header>
  );
}
