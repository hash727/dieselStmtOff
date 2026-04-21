// components/diagnostics/batch-ping-tool.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import router
import { pingAllOlts } from "@/app/actions/olt-diagnostic";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export function BatchPingTool() {
  const router = useRouter(); // Initialize router
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBatchPing = async () => {
    setIsScanning(true);
    setProgress(20);
    
    try {
      const results = await pingAllOlts();
      setProgress(100);
      
      const failures = results.filter(r => !r.success).length;
      
      // Force Next.js to fetch the new statuses from the DB
      router.refresh(); 

      if (failures > 0) {
        toast.error(`Scan complete: ${failures} nodes are currently DOWN.`);
      } else {
        toast.success("All nodes are ONLINE and status updated.");
      }
    } catch (error) {
      toast.error("System error during batch scan.");
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setProgress(0);
      }, 1500);
    }
  };

  return (
    <div className="p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isScanning ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-blue-100 text-blue-600'} dark:bg-zinc-900`}>
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Status Sync</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Live Database Update</span>
          </div>
        </div>
        <Button 
          size="sm" 
          disabled={isScanning}
          onClick={handleBatchPing}
          className="bg-slate-900 dark:bg-white dark:text-slate-900 font-black uppercase text-[10px] tracking-widest h-8 px-4"
        >
          {isScanning ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
          {isScanning ? "Updating DB..." : "Sync Status"}
        </Button>
      </div>

      {isScanning && (
        <div className="space-y-2">
          <Progress value={progress} className="h-1 bg-slate-100 dark:bg-zinc-900" />
          <p className="text-[8px] font-black text-amber-600 dark:text-amber-500 uppercase text-center animate-pulse">
            Pinging nodes & committing to database...
          </p>
        </div>
      )}
    </div>
  );
}
