"use client";

import { useEffect, useState } from "react";
import { runManualPing } from "@/app/actions/ping";
import { runCiscoPing } from "@/app/actions/router-diagnositcs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Loader2, Terminal, Activity, Signal, AlertCircle, 
  ShieldCheck, Cpu, HardDrive 
} from "lucide-react";

export default function ProfessionalPingTool({
  prefilledIp = ""
}: {
  prefilledIp?: string
}) {
  const [ip, setIp] = useState(prefilledIp);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"local" | "router">("router");

  useEffect(() => {
    setIp(prefilledIp);
    setResult(null); 
  }, [prefilledIp]);

  const handlePing = async () => {
    setLoading(true);
    let res;
    try {
      if (mode === "router") {
        res = await runCiscoPing(ip); 
      } else {
        res = await runManualPing(ip, 10);
      }
      setResult(res);
    } catch (error) {
      setResult({ success: false, error: "System communication failure." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Card className="shadow-lg border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-blue-500/20 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl tracking-tight">Network Diagnostic Console</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-semibold opacity-70">
                ICMP Latency & Circuit Stability Analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          {/* --- DIAGNOSTIC SOURCE SELECTOR --- */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className={`h-10 w-10 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center transition-all ${mode === 'router' ? 'bg-blue-600 z-10 scale-110 shadow-lg' : 'bg-slate-200 dark:bg-zinc-800'}`}>
                  <Cpu className={`h-5 w-5 ${mode === 'router' ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className={`h-10 w-10 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center transition-all ${mode === 'local' ? 'bg-emerald-600 z-10 scale-110 shadow-lg' : 'bg-slate-200 dark:bg-zinc-800'}`}>
                  <Signal className={`h-5 w-5 ${mode === 'local' ? 'text-white' : 'text-slate-400'}`} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Source Node</p>
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  {mode === "router" ? "Cisco Gateway (WAN)" : "Local App Server (LAN)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-inner">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={mode === "router" ? "default" : "ghost"} 
                      size="sm" 
                      onClick={() => setMode("router")}
                      className={`text-[10px] h-8 font-black uppercase transition-all ${
                        mode === "router" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-slate-500"
                      }`}
                    >
                      Cisco SSH
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 text-white border-zinc-800 text-[10px]">Test from Edge Router</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={mode === "local" ? "default" : "ghost"} 
                      size="sm" 
                      onClick={() => setMode("local")}
                      className={`text-[10px] h-8 font-black uppercase transition-all ${
                        mode === "local" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-slate-500"
                      }`}
                    >
                      Local PC
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 text-white border-zinc-800 text-[10px]">Test from Windows Host</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* --- INPUT SECTION --- */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Target IP or Hostname" 
                className="pl-10 font-mono tracking-tight bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
              />
            </div>
            <Button 
              onClick={handlePing} 
              disabled={loading || !ip}
              className={`${mode === 'router' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white shadow-lg transition-all active:scale-95 px-8 font-bold`}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
              {loading ? "Capturing Packets..." : "Run Diagnostic"}
            </Button>
          </div>

          {/* --- RESULTS SECTION --- */}
          {result?.success && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard label="Avg Latency" value={result.average} icon={<Activity className="text-blue-500" />} />
                <MetricCard 
                  label="Packet Loss" 
                  value={result.loss} 
                  subValue={result.loss === "0%" ? "Healthy Path" : "Unstable Link"}
                  status={result.loss === "0%" ? "success" : "warning"}
                  icon={<ShieldCheck className={result.loss === "0%" ? "text-emerald-500" : "text-amber-500"} />} 
                />
                <MetricCard label="Diagnostic Info" value="ICMPv4" subValue={`Source: ${mode.toUpperCase()}`} icon={<HardDrive className="text-slate-400" />} />
              </div>

              <div className="rounded-2xl bg-black border border-zinc-800 p-5 font-mono shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Raw Sequence Logs</span>
                  </div>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[9px] font-black uppercase">Live Output</Badge>
                </div>
                <div className="space-y-1.5 text-[13px] leading-relaxed">
                  {result.latencies.map((ms: string, i: number) => (
                    <div key={i} className="flex justify-between text-zinc-400 hover:bg-zinc-900/50 p-1.5 rounded transition-colors group">
                      <span className="group-hover:text-zinc-200">
                        <span className="text-zinc-700 mr-3 font-bold">{String(i+1).padStart(2, '0')}</span> 
                        Reply from <span className="text-zinc-500">{ip}</span>
                      </span>
                      <span className="text-emerald-400 font-black tabular-nums">{ms}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {result?.success === false && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-bold tracking-tight">{result.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, subValue, icon, status = "default" }: any) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className="opacity-50 group-hover:opacity-100 transition-opacity">{icon}</div>
      </div>
      <div className="text-3xl font-black tracking-tighter text-slate-900 dark:text-zinc-100">{value}</div>
      {subValue && (
        <div className={`text-[10px] mt-2 font-black uppercase tracking-tighter ${status === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-500"}`}>
          {subValue}
        </div>
      )}
    </div>
  );
}
