"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Cpu, 
  Wifi, 
  LogIn, 
  LogOut, 
  User, 
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SystemHeartbeat } from "./system-heartbeat";
import { useState } from "react";

export function GlobalNavbar() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const userRole = session?.user?.role;
  const isAdminOrManager = userRole === "ADMIN" || userRole === "MANAGER";

  const navLinks = [
    { name: "Diesel", href: "/dashboard", icon: LayoutDashboard, access: true },
    { name: "OLT", href: "/olt", icon: Cpu, access: isAdminOrManager },
    { name: "Leased Line", href: "/leasedlines", icon: Wifi, access: isAdminOrManager },
  ];

  return (
    <>
      {/* TRIGGER ZONE: Invisible bar at the very top to detect mouse entry */}
      <div 
        onMouseEnter={() => setIsVisible(true)}
        className="fixed top-0 left-0 w-full h-2 z-60" 
      />
    <nav 
      onMouseLeave={() => setIsVisible(false)}
      className={cn(
      "sticky top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LEFT: Branding */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-zinc-100 uppercase">
                SDOP <span className="text-blue-600">Core</span>
              </span>
            </Link>

            <SystemHeartbeat />

            {/* MIDDLE: Functional Links (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                if (!link.access) return null;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      isActive 
                        ? "bg-slate-100 dark:bg-zinc-900 text-blue-600 shadow-sm" 
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                    )}
                  >
                    <link.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Login/Profile Section */}
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-900 animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 flex items-center gap-3 px-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-[11px] font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-zinc-100">
                        {session.user?.name || "Operator"}
                      </span>
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">
                        {userRole}
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-slate-200 dark:border-zinc-800">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Account Details</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs font-bold gap-2 py-3 rounded-xl cursor-pointer">
                    <User className="h-4 w-4 text-slate-400" /> Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="text-xs font-bold gap-2 py-3 rounded-xl cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
                  >
                    <LogOut className="h-4 w-4" /> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => signIn()}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-widest px-6 h-9 rounded-xl hover:scale-105 transition-transform"
              >
                <LogIn className="mr-2 h-3.5 w-3.5" /> Portal Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
