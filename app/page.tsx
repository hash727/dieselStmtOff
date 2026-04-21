import React from 'react'
import { auth } from '@/auth' // Your Auth.js setup
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Cpu, 
  Wifi, 
  ArrowRight, 
  Lock,
  Network
} from "lucide-react"
import Link from 'next/link'
import { cn } from "@/lib/utils"

export default async function SDOPHomePage() {
  const session = await auth();
  const isAdminOrManager = session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-16 md:py-24">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 via-emerald-500 to-amber-500" />
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldCheck className="h-3 w-3" /> Secure Access Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-zinc-100 mb-4">
            SDOP <span className="text-blue-600">COMMAND CENTRE</span>
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 max-w-2xl font-medium leading-relaxed uppercase text-[11px] tracking-widest">
            Centralized Infrastructure Management System. Monitor energy consumption, fiber termination nodes, and core leased-line circuits.
          </p>
        </div>
      </div>

      {/* --- NAVIGATION GRID --- */}
      <div className="max-w-6xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Dashboard (Diesel Statements) */}
          <NavCard 
            title="Diesel Statement"
            href="/dashboard"
            description="Log generator runtimes, fuel refills, and monitor monthly consumption metrics."
            icon={<LayoutDashboard className="h-6 w-6 text-blue-600" />}
            accessible={true}
          />

          {/* 2. OLT Management */}
          <NavCard 
            title="OLT Infrastructure"
            href="/olt"
            description="Manage Optical Line Terminals, track franchisee (TIP) associations, and monitor fiber health."
            icon={<Cpu className="h-6 w-6 text-emerald-600" />}
            accessible={isAdminOrManager}
            isRestricted
          />

          {/* 3. Leased Lines */}
          <NavCard 
            title="Leased Line Core"
            href="/leasedlines"
            description="Network circuit diagnostics, latency logs, and core router SSH configuration."
            icon={<Wifi className="h-6 w-6 text-amber-600" />}
            accessible={isAdminOrManager}
            isRestricted
          />

        </div>
      </div>

      {/* --- SYSTEM LOG --- */}
      <div className="max-w-6xl mx-auto px-6 mt-16 text-center">
         <div className="flex items-center justify-center gap-8 py-6 border-t border-slate-200 dark:border-zinc-800 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">IPv4 Stack Active</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encryption</span>
            </div>
         </div>
      </div>
    </div>
  )
}

// --- CARD SUB-COMPONENT ---

function NavCard({ title, href, description, icon, accessible, isRestricted }: any) {
  return (
    <Link href={accessible ? href : "#"} className={cn(
        "group relative flex flex-col justify-between p-8 rounded-3xl border transition-all duration-300",
        accessible 
            ? "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1" 
            : "bg-slate-100 dark:bg-zinc-950 border-slate-200 dark:border-zinc-900 opacity-75 cursor-not-allowed"
    )}>
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {isRestricted && (
            <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border",
                accessible ? "border-blue-200 bg-blue-50 text-blue-600" : "border-slate-300 bg-slate-200 text-slate-500"
            )}>
              {accessible ? "Authorized" : <><Lock className="h-2 w-2" /> Restricted</>}
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 mb-3 uppercase tracking-tight">
            {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-medium mb-8">
            {description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Access</span>
         <div className={cn(
             "h-8 w-8 rounded-full flex items-center justify-center transition-all",
             accessible ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:translate-x-1" : "bg-slate-200 text-slate-400"
         )}>
            <ArrowRight className="h-4 w-4" />
         </div>
      </div>
    </Link>
  )
}
