// components/nav/system-heartbeat.tsx
"use client";

import { useEffect, useState } from "react";
import { checkGatewayStatus } from "@/app/actions/heartbeat";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

export function SystemHeartbeat() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const checkHealth = async () => {
    const status = await checkGatewayStatus();
    setIsOnline(status);
  };

  useEffect(() => {
    checkHealth(); // Initial check
    const interval = setInterval(checkHealth, 60000); // Repeat every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
      <div className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          isOnline === null ? "bg-slate-300" : isOnline ? "bg-emerald-500" : "bg-red-500"
        )}></span>
      </div>
      
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
          Gateway
        </span>
        <span className={cn(
          "text-[10px] font-bold uppercase",
          isOnline === null ? "text-slate-400" : isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"
        )}>
          {isOnline === null ? "Syncing..." : isOnline ? "Active" : "Down"}
        </span>
      </div>
    </div>
  );
}
