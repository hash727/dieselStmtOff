// app/olt/_components/olt-sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Activity, FileText, Cpu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const oltNav = [
  { name: "Dashboard", href: "/olt/dashboard", icon: LayoutDashboard },
  { name: "Manage OLTs", href: "/olt/manage", icon: Settings },
  { name: "Manual Diagnostic", href: "/olt/manual-ping", icon: Activity },
  { name: "System Reports", href: "/olt/reports", icon: FileText },
];

export function OltSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-72 border-r border-slate-200 dark:border-zinc-800 p-6 space-y-8 bg-white dark:bg-zinc-950 h-screen">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
          <Cpu className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-tighter text-slate-900 dark:text-zinc-100 uppercase">OLT Core</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fiber Management</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {oltNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn(
              "group flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all font-bold",
              isActive ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                       : "text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
            )}>
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4 animate-in slide-in-from-left-1" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
