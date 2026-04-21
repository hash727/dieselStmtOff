// app/leasedline/_components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Activity, 
  History, 
  Settings2, 
  ChevronRight,
  Wifi,
  LucideGitGraph,
  Search,
  SearchCheck
} from "lucide-react";

const navItems = [
  { 
    name: "Overview", 
    href: "/leasedlines", 
    icon: LayoutDashboard,
    description: "Circuit health & live status" 
  },
  { 
    name: "Traffic Analysis", 
    href: "/leasedlines/connect", 
    icon: Activity,
    description: "Bandwidth usage graphs" 
  },
  { 
    name: "Search LL", 
    href: "/leasedlines/search-leasedline", 
    icon: SearchCheck,
    description: "Bandwidth usage graphs" 
  },
  { 
    name: "Diagnositcs", 
    href: "/leasedlines/diagnostics", 
    icon: History,
    description: "Past incidents & downtime" 
  },
  { 
    name: "Manual Ping", 
    href: "/leasedlines/manual-ping", 
    icon: Settings2,
    description: "Router IP & SSH settings" 
  },
  { 
    name: "Analysis", 
    href: "/leasedlines/analysis", 
    icon: LucideGitGraph,
    description: "Chart Analysis" 
  },
];

export function LeasedLineSidebar({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn(
      "w-72 border-r border-slate-200 dark:border-zinc-800 p-6 space-y-8 bg-slate-50/50 dark:bg-zinc-950 h-screen",
      !isMobile && "hidden md:block" // Only hide on desktop if not in mobile mode
    )}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
          <Wifi className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-tighter text-slate-900 dark:text-zinc-100 uppercase">Leased Line</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Core</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200",
                isActive 
                  ? "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm" 
                  : "hover:bg-slate-100 dark:hover:bg-zinc-900/50 text-slate-500 dark:text-zinc-400"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-blue-600" : "group-hover:text-slate-900 dark:group-hover:text-zinc-100"
                )} />
                <div className="flex flex-col">
                  <span className={cn(
                    "font-bold leading-none mb-1",
                    isActive ? "text-slate-900 dark:text-zinc-100" : ""
                  )}>
                    {item.name}
                  </span>
                  {/* Notification Badge Example */}
                  {item.name === "Diagnostic" && (
                    <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white animate-pulse">
                      !
                    </span>
                  )}
                  <span className="text-[10px] opacity-60 font-medium">
                    {item.description}
                  </span>

                </div>
              </div>
              
              {isActive && (
                <ChevronRight className="h-4 w-4 text-blue-600 animate-in slide-in-from-left-1" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Status Footer */}
      <div className="absolute bottom-8 left-6 right-6">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">System Ready</span>
          </div>
          <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/50 font-medium">
            All circuits operational via Cisco-GW1
          </p>
        </div>
      </div>
    </nav>
  );
}
