// app/olt/_components/syrotech-manage-sheet.tsx
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSyrotechChassisInventory, getSyrotechPortInventory, getSyrotechOpmDiagnostics, getSyrotechPortRunningConfigs } from "@/app/actions/olt-management";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Server, Users, Search, ArrowLeft, Layers, ShieldAlert, Zap, Monitor, Terminal, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SyrotechManageSheet({ olt, isOpen, onOpenChange }: any) {
  const [loading, setLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [chassisMeta, setChassisMeta] = useState<any>({ mac: "N/A", status: "N/A", firmware: "N/A" });
  const [portCards, setPortCards] = useState<any[]>([]);
  const [onuData, setOnuData] = useState<any[]>([]);
  const [powerData, setPowerMap] = useState<Record<string, string>>({});
  
  const [selectedPort, setSelectedPort] = useState<string>("1");
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [rawConsole, setRawConsole] = useState<string>("");

  const [onuConfigs, setOnuConfigs] = useState<Record<string, string>>({});

  // --- LASER OPM SWEEP CORE ---
  const fetchPortOptics = async (portId: string) => {
    setIsBulkLoading(true);
    try {
      const res = await getSyrotechOpmDiagnostics(olt.id, portId);
      setRawConsole(res.raw || "");
      if (res.success && typeof res.data === "object") {
        const opmResult = res.data as Record<string, string>;
        const remappedPower: Record<string, string> = {};
        
        Object.keys(opmResult).forEach((onuIdx) => {
          remappedPower[`${portId}/${onuIdx}`] = opmResult[onuIdx];
        });

        setPowerMap((prev) => ({ ...prev, ...remappedPower }));
        toast.success(`Port ${portId} Laser Telemetry Synced`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBulkLoading(false);
    }
  };

  // --- INITIAL CHASSIS FLUSH ---
  const handleRefreshChassis = async () => {
    setLoading(true);
    setPowerMap({});
    setOnuData([]);
    try {
      const res = await getSyrotechChassisInventory(olt.id);
      if (res.success && Array.isArray(res.ports)) {
        const successResult = res as { data: any; ports: any[]; raw: string };
        setChassisMeta(successResult.data);
        setPortCards(successResult.ports);
        setRawConsole(successResult.raw || "");
        
        setSelectedPort("1");
        toast.success("Syrotech Core Chassis Matrix Synced");
        await handlePortClick("1");
      }
    } catch (e) {
      toast.error("NOC Master sync timeout");
    } finally {
      setLoading(false);
    }
  };

  // --- PORT ACTION TARGET ---
  const handlePortClick = async (portId: string) => {
    setSelectedPort(portId);
    setLoading(true);
    setOnuConfigs({});
    try {
      const res = await getSyrotechPortInventory(olt.id, portId);
      setRawConsole(res.raw || "")
      if (res.success && Array.isArray(res.data)) {
        setOnuData((prev) => {
          const cleaned = prev.filter((o) => o.port !== portId);
          return [...cleaned, ...res.data];
        });
        // ✅  COMPREHENSIVE RUNNING CONFIG SCRIPT BLUEPRINT PULL
        toast.info(`Downloading port script configuration metrics blueprints...`);
        const configRes = await getSyrotechPortRunningConfigs(olt.id, portId);
        if (configRes.success && configRes.data) {
            setOnuConfigs(configRes.data as Record<string, string>);
        }
        await fetchPortOptics(portId);
      }
    } catch (e) {
      toast.error("Connection failed reading port details");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER CORE SUBSCRIBERS ---
  const filteredOnus = useMemo(() => {
    return onuData.filter((o) => o.port === selectedPort && (o.sn.toLowerCase().includes(searchQuery.toLowerCase()) || o.mac.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [onuData, selectedPort, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw]! w-[98vw] h-[96vh] p-0 flex flex-col bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-xl overflow-hidden">
        
        {/* --- 1. ENTERPRISE HEADER HUD --- */}
        <div className="h-14 px-5 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-600/10 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded border border-purple-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                {olt?.make || "SYSTEM"} <span className="text-[10px] font-medium text-slate-400 lowercase border-l pl-2 border-slate-200 dark:border-zinc-700">epon carrier-grade core matrix</span>
              </DialogTitle>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span className="font-semibold">{olt?.name}</span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span>IP: {olt?.ip}</span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span>BASE MAC: {chassisMeta.mac}</span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">FW: {chassisMeta.firmware}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mr-3">
            <div className="bg-slate-100 dark:bg-zinc-950 p-0.5 rounded border border-slate-200 dark:border-zinc-800 flex gap-0.5">
               <Button size="sm" variant={viewMode === 'table' ? 'secondary' : 'ghost'} onClick={() => setViewMode('table')} className={cn("h-7 px-3 text-[10px] uppercase font-bold rounded", viewMode === 'table' ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-zinc-700" : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100")}>Chassis Map</Button>
               <Button size="sm" variant={viewMode === 'raw' ? 'secondary' : 'ghost'} onClick={() => setViewMode('raw')} className={cn("h-7 px-3 text-[10px] uppercase font-bold rounded", viewMode === 'raw' ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-zinc-700" : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100")}>Raw Shell</Button>
            </div>
            <Button 
                onClick={handleRefreshChassis} 
                disabled={loading || isBulkLoading} 
                variant="outline"
                className="h-8 px-4 border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] uppercase rounded transition-colors"
            >
              {loading ? <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
              Synchronize OLT
            </Button>
          </div>
        </div>

        {/* --- 2. DYNAMIC WORKSPACE SPLIT-PANE --- */}
        {viewMode === "table" ? (
          <div className="flex-1 flex overflow-hidden bg-slate-100 dark:bg-zinc-950">
            
            {/* 🔴 LEFT SIDEBAR: FIXED CHASSIS PORT MODULE CONTROLLER */}
            <aside className="w-80 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-4 gap-3">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Physical SFP Slots</span>
                <Badge variant="outline" className="text-[8px] font-mono border-slate-200 text-slate-500">Chassis Size: {portCards.length || 4}P</Badge>
              </div>

              <div className="flex flex-col gap-2">
                {portCards.map((port) => {
                  const isSelected = selectedPort === port.id;
                  const hasOfflineIssues = port.offline > 0;

                  return (
                    <button
                      key={port.id}
                      onClick={() => handlePortClick(port.id)}
                      disabled={loading || isBulkLoading}
                      className={cn(
                        "p-3 rounded border text-left flex flex-col gap-2 transition-all relative overflow-hidden group active:scale-[0.99]",
                        isSelected 
                          ? "bg-purple-600/4 border-purple-500 dark:border-purple-400 shadow-sm" 
                          : "bg-transparent border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      {hasOfflineIssues && (
                        <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                      )}

                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                           <Server className={cn("h-3.5 w-3.5", isSelected ? "text-purple-500" : "text-slate-400 dark:text-slate-500")} />
                           <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{port.interface}</span>
                        </div>
                        <span className={cn("text-[9px] font-mono font-bold px-1 py-0.5 rounded", isSelected ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" : "bg-slate-50 dark:bg-zinc-950 text-slate-400")}>
                          {port.uptimePercent}%
                        </span>
                      </div>

                      {/* Micro Metric Counters Grid */}
                      <div className="grid grid-cols-2 gap-2 w-full text-[10px] mt-0.5">
                         <div className="flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">ON</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{port.online}</span>
                         </div>
                         <div className={cn("flex items-center justify-between px-2 py-1 border rounded", hasOfflineIssues ? "bg-red-500/3 border-red-500/10 text-red-600" : "bg-slate-50 dark:bg-zinc-950 border-slate-100 dark:border-zinc-900 text-slate-400")}>
                            <span className="text-[8px] font-bold uppercase">OFF</span>
                            <span className="font-mono font-bold">{port.offline}</span>
                         </div>
                      </div>

                      {/* Bottom Alignment Micro Health Progress Line */}
                      <div className="w-full h-0.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex mt-1">
                        <div className="h-full bg-emerald-500" style={{ width: `${port.uptimePercent}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${100 - port.uptimePercent}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {portCards.length === 0 && !loading && (
                <div className="py-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest italic border border-dashed rounded border-slate-200 dark:border-zinc-800 mt-4 flex flex-col items-center gap-2">
                   <Radio className="h-4 w-4 text-slate-300 animate-pulse" />
                   Awaiting Initial Sync
                </div>
              )}
            </aside>

            {/* 🟢 RIGHT PANEL: HIGH-DENSITY SUBSCRIBER LINEAR ROW MATRIX */}
            <main className="flex-1 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
               
               {/* INTEGRATED QUICK FILTERS & SEARCH ROW */}
               <div className="h-12 px-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                     <Users className="h-4 w-4 text-purple-500" />
                     <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Channel Interface Summary: {portCards.find(c => c.id === selectedPort)?.interface || `EPON 0/${selectedPort}`}</h4>
                     {isBulkLoading && <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[8px] px-2 h-4 uppercase font-bold tracking-wider animate-pulse">opm laser telemetry tracing</Badge>}
                  </div>
                  <div className="relative w-80">
                     <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                     <Input 
                       placeholder="Filter by MAC Key or Serial Number..." 
                       className="pl-9 h-8 border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-xs font-medium focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:ring-offset-0" 
                       value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} 
                     />
                  </div>
               </div>

               {/* TABULAR ROW SHEET SCHEDULER */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                  <div className="rounded border border-slate-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 h-9 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              <th className="px-4 font-bold w-16">ONU (#)</th>
                              <th className="px-4 font-bold w-24">Link State</th>
                              {/* ✅ NEW HEADER DATA COLUMN */}
                              <th className="px-4 font-bold w-32">Subscriber account</th> 
                              <th className="px-4 font-bold">Serial No.</th>
                              <th className="px-4 font-bold">Hardware MAC Address</th>
                              <th className="px-4 font-bold w-36">ONT Type</th>
                              <th className="px-4 font-bold text-center w-24">Loop Distance</th>
                              <th className="px-4 font-bold text-center w-28">OPM Optics (Rx)</th>
                              <th className="px-4 font-bold text-right w-40 pr-6">Deregister Log</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                           {filteredOnus.map((onu, idx) => {
                              const compositeKey = `${onu.port}/${onu.pon}`;
                              const powerValue = powerData[compositeKey];
                              
                              const numericPower = powerValue ? parseFloat(powerValue) : null;
                              const isCritical = numericPower !== null && numericPower <= -27.00;
                              const isWarning = numericPower !== null && numericPower <= -24.00 && numericPower > -27.00;
                              const isOnline = onu.status === 'Operational';

                              // ✅ FETCH SCRUBBED RUNNING CONFIG DESCRIPTION KEY ASSIGNMENTS FOR THIS SPREADSHEET ROW
                              const accountDescription = onuConfigs[onu.pon] || onu.account || "No Description";

                              return (
                                 <tr key={idx} className="h-10 text-[11px] hover:bg-slate-50/10 dark:hover:bg-zinc-800/30 transition-colors border-b cursor-pointer">
                                    <td className="px-4 font-mono font-bold text-slate-900 dark:text-zinc-300">#{onu.pon}</td>
                                    <td className="px-4">
                                       <span className={cn(
                                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
                                          isOnline 
                                             ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" 
                                             : "bg-red-500/5 text-red-600 border-red-500/20"
                                       )}>
                                          {isOnline ? 'Online' : 'Offline'}
                                       </span>
                                    </td>

                                    {/* ✅ NEW SPREADSHEET ELEMENT VALUE CELL MOUNTED IMMEDIATELY AFTER ONLINE STATUS BADGE */}
                                    <td className="px-4">
                                        <span className="font-mono font-black text-purple-600 dark:text-purple-400 bg-purple-500/3 px-2 py-1 rounded border border-purple-500/10 block w-fit" title={accountDescription}>
                                            {accountDescription}
                                        </span>
                                    </td>
                                    <td className="px-4 font-mono text-slate-600 dark:text-slate-400 uppercase tracking-tight">{onu.sn}</td>
                                    <td className="px-4 font-mono font-medium text-slate-500 tracking-tighter">{onu.mac}</td>
                                    <td className="px-4 text-slate-600 dark:text-slate-400 font-mono font-semibold">{onu.vendorID} - {onu.model || "Default"}</td>
                                    <td className="px-4 text-center font-mono font-medium text-slate-500">{onu.distance}</td>
                                    <td className="px-4 text-center">
                                       <span className={cn(
                                          "font-mono font-bold px-1.5 py-0.5 rounded",
                                          !isOnline ? "text-slate-300 dark:text-zinc-700 bg-transparent" :
                                          isCritical ? "text-red-600 bg-red-500/10" : 
                                          isWarning ? "text-amber-600 bg-amber-500/10" : 
                                          "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/10"
                                       )}>
                                          {isOnline ? (powerValue || (isBulkLoading ? '...' : '--')) : 'OFFLINE'}
                                       </span>
                                    </td>
                                    <td className="px-4 text-right pr-6">
                                       {!isOnline && onu.deregReason !== "N/A" ? (
                                          <span className={cn(
                                             "font-mono text-[9px] font-bold px-2 py-0.5 border rounded",
                                             onu.deregReason === 'Power Off' ? 'bg-amber-500/5 text-amber-600 border-amber-500/10' : 'bg-slate-100 text-slate-500 border-slate-200'
                                          )}>
                                             {onu.deregReason}
                                          </span>
                                       ) : <span className="text-slate-300 dark:text-zinc-700 font-mono">--</span>}
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>

                  {filteredOnus.length === 0 && portCards.length > 0 && (
                     <div className="py-16 text-center text-xs text-slate-400 font-bold uppercase tracking-widest italic border border-dashed rounded border-slate-200 dark:border-zinc-800 m-2">
                        No active loop profiles recorded inside this interface spreadsheet matrix.
                     </div>
                  )}
               </div>
            </main>
          </div>
        ) : (
          /* CORPORATE SYSTEM LINUX TERMINAL SCREEN */
          <div className="p-5 flex-1 bg-black/95 overflow-y-auto border-t dark:border-zinc-800">
             <div className="flex items-center gap-2 mb-3 text-zinc-600 font-mono text-[10px]">
                <Terminal className="h-3.5 w-3.5" />
                <span>NOC CONSOLE RESPONSE INTERCEPT STREAM</span>
             </div>
             <pre className="text-purple-400 dark:text-purple-400 font-mono text-[11px] leading-relaxed whitespace-pre-wrap selection:bg-purple-500/20">{rawConsole || "No script readout logged. Execute Fetch Telemetry to initialize socket links."}</pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
