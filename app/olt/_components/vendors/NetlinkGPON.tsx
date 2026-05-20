"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, Activity, Wifi, Phone, ShieldAlert, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function NetlinkGPON({ data, powerData, isBulkLoading, onOnuClick }: any) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. PHYSICAL PORT GRID (The "Front Panel") */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] border-8 border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Front Panel</span>
          </div>
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[9px] font-black uppercase">Netlink Chassis v2</Badge>
        </div>

        {/* 8/16 Port Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((portNum) => {
            const portOnus = data.filter((o: any) => o.port === portNum.toString());
            const offlineCount = portOnus.filter((o: any) => o.status !== 'Operational').length;
            
            return (
              <div key={portNum} className="relative group">
                <div className={cn(
                  "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-default",
                  offlineCount > 0 ? "border-red-500/50 bg-red-500/5" : "border-slate-700 bg-slate-800/50"
                )}>
                  <div className="w-10 h-6 bg-slate-950 rounded border-b-4 border-slate-700 flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-500">{portNum}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-white">{portOnus.length} ONUs</span>
                    {offlineCount > 0 && (
                      <span className="text-[8px] font-black text-red-500 animate-pulse">{offlineCount} DOWN</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SUBSCRIBER TILE VIEW (Replacing the Table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map((onu: any, i: number) => {
          const power = powerData[onu.pon];
          const isCritical = power && parseFloat(power) <= -27;

          return (
            <div 
              key={i} 
              onClick={() => onOnuClick(onu)}
              className={cn(
                "relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[2rem] border-2 p-5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group",
                onu.status === 'Operational' ? "border-slate-100 dark:border-zinc-800" : "border-red-100 dark:border-red-900/30"
              )}
            >
              {/* Status "Glow" Backdrop */}
              <div className={cn(
                "absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-20 transition-all group-hover:opacity-40",
                onu.status === 'Operational' ? "bg-emerald-500" : "bg-red-500"
              )} />

              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", onu.status === 'Operational' ? "bg-emerald-500" : "bg-red-500 animate-ping")} />
                    <span className="text-[11px] font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tighter">
                      ONU Index: {onu.pon}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono font-bold text-slate-400">{onu.sn}</p>
                </div>
                <Badge className={cn(
                  "text-[9px] font-black uppercase rounded-lg border-none px-2",
                  onu.status === 'Operational' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                  {onu.status === 'Operational' ? 'Online' : 'Warning'}
                </Badge>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 relative z-10">
                {/* ACCOUNT BOX */}
                <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Subscriber</span>
                  <span className="text-xs font-black text-slate-700 dark:text-zinc-300 truncate block">
                    {onu.account}
                  </span>
                </div>

                {/* OPTICS BOX */}
                <div className={cn(
                  "p-3 rounded-2xl border flex flex-col justify-center transition-colors",
                  isCritical ? "bg-red-50 border-red-200" : "bg-slate-50 dark:bg-zinc-950 border-slate-100 dark:border-zinc-800"
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Signal</span>
                    <Zap className={cn("h-3 w-3", isCritical ? "text-red-500" : "text-emerald-500")} />
                  </div>
                  <span className={cn("text-xs font-black font-mono", isCritical ? "text-red-600" : "text-slate-900 dark:text-zinc-100")}>
                    {power || (isBulkLoading ? '...' : '--')}
                  </span>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                 <div className="flex gap-2">
                    <Wifi className="h-3 w-3 text-slate-300" />
                    <Phone className="h-3 w-3 text-slate-300" />
                 </div>
                 <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect Config →
                 </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
