// app/olt/_components/olt-ping-console.tsx
"use client";

import { useEffect, useState } from "react";
import { runOltDiagnostic } from "@/app/actions/olt-diagnostic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, HardDrive, Search, Loader2, Activity, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function OltPingConsole({ 
  olts, 
  initialIp = ""
}: { 
  olts: any[], 
  initialIp?: string 
}) {
  const [targetIp, setTargetIp] = useState(initialIp);
  const [mode, setMode] = useState<"local" | "router">("local");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (initialIp) {
      setTargetIp(initialIp || "");
    }
  }, [initialIp]);


  const handleStartPing = async () => {
    if (!targetIp) return toast.error("Please enter or select an IP");
    setLoading(true);
    const res = await runOltDiagnostic(targetIp, mode);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Control Panel */}
      <div className="space-y-4">
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Diagnostic Source</h3>
          </div>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Button 
                variant={mode === "local" ? "default" : "outline"}
                className={`justify-start gap-3 h-12 ${mode === 'local' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : ''}`}
                onClick={() => setMode("local")}
              >
                <HardDrive className="h-4 w-4" />
                <div className="text-left">
                  <p className="text-xs font-black uppercase leading-none">Local Server</p>
                  <p className="text-[10px] opacity-60">Ping from Windows App Host</p>
                </div>
              </Button>

              <Button 
                variant={mode === "router" ? "default" : "outline"}
                className={`justify-start gap-3 h-12 ${mode === 'router' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : ''}`}
                onClick={() => setMode("router")}
              >
                <Cpu className="h-4 w-4" />
                <div className="text-left">
                  <p className="text-xs font-black uppercase leading-none">Cisco Router</p>
                  <p className="text-[10px] opacity-60">Ping via Cisco GW (SSH)</p>
                </div>
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
               <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Target IP Address</label>
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                 <Input 
                   placeholder="10.x.x.x" 
                   value={targetIp ?? ""} 
                   onChange={(e) => setTargetIp(e.target.value)}
                   className="pl-9 font-mono font-bold bg-slate-50 dark:bg-zinc-900 border-none"
                 />
               </div>
            </div>

            <Button 
              className="w-full h-11 bg-slate-900 dark:bg-white dark:text-slate-900 font-black uppercase text-xs tracking-widest"
              onClick={handleStartPing}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              Execute ICMP Scan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right: Results Terminal */}
      <div className="lg:col-span-2 space-y-4">
        {result?.success ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Avg Latency</p>
                <p className="text-2xl font-black text-blue-600">{result.latency}</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Packet Loss</p>
                <p className={`text-2xl font-black ${result.loss === '0%' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {result.loss}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0c0c0c] border border-zinc-800 p-6 font-mono shadow-2xl relative">
              <div className="absolute top-4 right-6 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Output</span>
              </div>
              <pre className="text-xs text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {result.raw}
              </pre>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[300px] rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center text-slate-400 gap-4">
             <Activity className="h-12 w-12 opacity-20" />
             <p className="text-xs font-bold uppercase tracking-widest opacity-50">
               {loading ? "Capturing Packets..." : "Diagnostic Idle - Start Scan"}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
