// app/olt/_components/netlink-manage-sheet.tsx
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getNetlinkFullChassisInventory, getNetlinkInventory, getNetlinkOnuDeepDiagnostics, getNetlinkOnuPower, getNetlinkPortRunningConfigs, getNetlinkPortStates, getOnuServices } from "@/app/actions/olt-management";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, RefreshCw, Terminal, Search, ChevronRight, 
  Users, Cpu, Server, Zap, ArrowLeft, Wifi, Activity, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NetlinkManageSheet({ olt, isOpen, onOpenChange }: any) {
  const [loading, setLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  
  // Storage Pools
  const [onuData, setOnuData] = useState<any[]>([]);
  const [powerData, setPowerMap] = useState<Record<string, string>>({});
  const [onuStates, setOnuStates] = useState<Record<string, string>>({});
  const [serviceCards, setServiceCards] = useState<any[]>([]);
  
  // UI Coordinates
  const [selectedOnu, setSelectedOnu] = useState<any | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPort, setSelectedPort] = useState<string>("1");
  const [rawConsole, setRawConsole] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");

  const [deepDiag, setDeepDiag] = useState<any | null>(null);
  const [loadingDiag, setLoadingDiag] = useState(false);

  const [sfpHealthData, setSfpHealthData] = useState<Record<string, { txPower: string; temp: string; isHealthy: boolean }>>({});

  const [onuConfigs, setOnuConfigs] = useState<Record<string, string>>({});

  // --- AUTOMATED OPTICS LASER SCAN ---
  const fetchPortPower = async (portId: string, currentDataset: any[]) => {
    const currentOnus = currentDataset.filter(o => o.port === portId);
    if (!currentOnus.length) return;
    
    setIsBulkLoading(true);
    const indexes = currentOnus.map(o => String(o.pon));
    const res = await getNetlinkOnuPower(olt.id, portId, indexes);
  
    if (res.success && res.data && typeof res.data === 'object') {
      const powerResult = res.data as Record<string, string>;
      
      // Remap raw flat response indices to unified composite structural storage keys ("port/index")
      const remappedPower: Record<string, string> = {};
      Object.keys(powerResult).forEach(onuIdx => {
         remappedPower[`${portId}/${onuIdx}`] = powerResult[onuIdx];
      });

      setPowerMap(prev => ({ ...prev, ...remappedPower }));
    }
    setIsBulkLoading(false);
  };

  // --- REFRESH COMPLETE CHASSIS AT ONCE (Solves 0 count bug) ---
  const handleRefreshChassis = async () => {
    setLoading(true);
    setPowerMap({});
    setOnuStates({});
    setSfpHealthData({}); // Clean up baseline
    setSelectedOnu(null);
    try {
      // Pulls all 8 ports sequentially internally or concurrently to return massive unified snapshot array
      const res = await getNetlinkFullChassisInventory(olt.id);
      
      if (res.success && Array.isArray(res.data)) {
        const successResult = res as { data: any[]; raw: string; sfpData: any };

        setOnuData(successResult.data);
        setSfpHealthData(successResult.sfpData || {}); // Populate OLT SFP metrics dictionary
        setRawConsole(successResult.raw || "");
        setSelectedPort("1");
        toast.success("Global Chassis Telemetry Online");

         // Auto-fetch subscriber optics for active Port 1
        await fetchPortPower("1", successResult.data);

      } else {
        const errorMsg = (res as any).error || "Telemetry collection failure.";
        toast.error(errorMsg);
        setOnuData([]);
      }
    } catch (e) { 
      toast.error("NOC Synchronization failure"); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- MANUAL SEPARATE PORT CLICK EVENT ---
  const handlePortClick = async (portId: string) => {
     setSelectedPort(portId);
     setSelectedOnu(null);
     setOnuConfigs({}); // Flush stale caching maps
     
     // Only trigger manual fetch if inventory array for this port doesn't exist yet, 
     // otherwise read directly from existing cache to keep counters locked
     const missingLocalData = !onuData.some(o => o.port === portId);
     
     if (missingLocalData) {
        setLoading(true);
        try {
            const res = await getNetlinkInventory(olt.id, portId);
            if (res.success && res.data && Array.isArray(res.data)) {
                const successResult = res as { data: any[]; raw: string };
               setOnuData(prev => {
                  const cleaned = prev.filter(o => o.port !== portId);
                  return [...cleaned, ...successResult.data];
               });
               toast.success(`Port ${portId} Inventory Loaded`);

                // ✅ COMPREHENSIVE RUNNING CONFIG DATA STREAM EXTRACTION WORKER
                toast.info(`Downloading running configurations script blueprints...`);
                const targetIndexes = successResult.data.map(o => String(o.pon));

                toast.info(`Querying active hardware configuration scripts blueprints...`);

                const configRes = await getNetlinkPortRunningConfigs(olt.id, portId, targetIndexes);
                if (configRes.success && configRes.data) {
                    setOnuConfigs(configRes.data as Record<string, string>);
                }
               await fetchPortPower(portId, res.data);
            } else {
                toast.error((res as any).error || "Failed to load port inventory");
            }
        } catch (e) { 
            console.error(e); 
            toast.error("Bridge Synchronization Timeout");
        } 
        finally { setLoading(false); }
     } else {
        // // If data is already in cache, just update the power levels
        // await fetchPortPower(portId, onuData);
        setLoading(true);
        try {
            const targetIndexes = onuData.filter(o => o.port === portId).map(o => String(o.pon));
            const configRes = await getNetlinkPortRunningConfigs(olt.id, portId, targetIndexes);
            if (configRes.success && configRes.data) {
                setOnuConfigs(configRes.data as Record<string, string>);
            }
            await fetchPortPower(portId, onuData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
     }
  };

  // --- SERVICE INSPECTOR ---
  const handleInspect = async (onu: any) => {
    setSelectedOnu(onu);
    setLoadingServices(true);
    setLoadingDiag(true);
    setDeepDiag(null);
    setServiceCards([]);
    
    try {
      // Fire Phase A: Fetch deep link hardware parameters (optics, up-time, distance)
      const diagRes = await getNetlinkOnuDeepDiagnostics(olt.id, selectedPort, onu.pon);
      if (diagRes.success) {
        setDeepDiag(diagRes.data);
      }
  
    //   // Fire Phase B: Fetch standard configuration networking service bridges
    //   const res = await getOnuServices(olt.id, `${selectedPort}/${onu.pon}`);
    //   if (res.success && Array.isArray(res.data)) {
    //     setServiceCards(res.data);
    //   }
    } catch (e) { 
      toast.error("Telemetry link trace interrupted"); 
    } finally { 
      setLoadingServices(false);
      setLoadingDiag(false);
    }
  };

  // --- DATA FILTERING BY INTERFACE (Solves Offline Status Mismatch Bug) ---
  const filteredOnus = useMemo(() => {
    return onuData.filter(o => {
      if (o.port !== selectedPort) return false;

      // Composite pointer resolution "port/index" (e.g. "1/2")
      const compositeKey = `${o.port}/${o.pon}`;
      const currentPhase = onuStates[compositeKey] || "working"; // Default to working if state not loaded yet
      
      const matchesSearch = o.sn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            o.account.toLowerCase().includes(searchQuery.toLowerCase());
  
      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        if (statusFilter === "Operational") matchesStatus = currentPhase === "working";
        if (statusFilter === "Ranging") matchesStatus = currentPhase === "ranging";
        if (statusFilter === "Popup") matchesStatus = currentPhase === "popup";
        if (statusFilter === "Offline") matchesStatus = currentPhase === "offline" || currentPhase === "dyinggasp";
      }
  
      return matchesSearch && matchesStatus;
    });
  }, [onuData, selectedPort, searchQuery, statusFilter, onuStates]);

  
  // --- REALTIME PORT COUNT MATRIX COMPUTATION ---
  const portStats = useMemo(() => {
    const stats: any = {};
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(p => {
      const items = onuData.filter(o => o.port === p.toString());
      const onlineOnus = items.filter(o => {
         const compositeKey = `${o.port}/${o.pon}`;
         const phase = onuStates[compositeKey] || "working";
         return phase === "working";
      }).length;
  
      stats[p] = { 
        total: items.length, 
        online: onlineOnus 
      };
    });
    return stats;
  }, [onuData, onuStates]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw]! w-[98vw] h-[96vh] p-0 gap-0 overflow-hidden bg-slate-950 border-none shadow-2xl rounded-[3rem]">
        
        {/* TOP HUD HEADER BAR */}
        <div className="p-6 flex items-center justify-between bg-slate-900/50 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-orange-600 rounded-[1.5rem] shadow-xl shadow-orange-500/20 text-white">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter italic">
                NETLINK <span className="text-orange-500 text-xs not-italic ml-2 tracking-widest">NOC HARDWARE ENGINE</span>
              </DialogTitle>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">
                {olt?.name} • IP IP: {olt?.ip}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-1 rounded-xl flex gap-1 border border-white/5 mr-2">
               <Button size="sm" variant={viewMode === 'table' ? 'secondary' : 'ghost'} onClick={() => setViewMode('table')} className="h-8 px-4 text-[10px] uppercase font-black text-white">Chassis Explorer</Button>
               <Button size="sm" variant={viewMode === 'raw' ? 'secondary' : 'ghost'} onClick={() => setViewMode('raw')} className="h-8 px-4 text-[10px] uppercase font-black text-white">CLI Output</Button>
            </div>
            <Button 
                onClick={handleRefreshChassis} 
                disabled={loading || isBulkLoading} 
                className="bg-white hover:bg-slate-200 text-slate-950 font-black text-xs uppercase px-8 h-12 rounded-2xl transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh Chassis
            </Button>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
            
            {/* 1. PHYSICAL FRONT PANEL HUB PANEL */}
            {!selectedOnu && (
              <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 shadow-inner shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", onuData.length > 0 ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-zinc-700")} /> 
                    SFP Module Optical Interfaces
                  </span>
                  <Badge variant="outline" className="border-orange-500/30 text-orange-500 text-[9px] font-black uppercase">Slot 0 Configuration</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => {
                    const stats = portStats[p];
                    const isSelected = selectedPort === p.toString();
                    
                    // Read cached SFP telemetry parameters for this exact port block
                    const sfp = sfpHealthData[p.toString()];

                    return (
                    <button
                        key={p}
                        onClick={() => handlePortClick(p.toString())}
                        disabled={loading || isBulkLoading}
                        className={cn(
                        "h-28 rounded-3xl border-2 flex flex-col items-center justify-between p-3 transition-all relative overflow-hidden group active:scale-95",
                        isSelected 
                            ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/5" 
                            : sfp && !sfp.isHealthy 
                            ? "border-red-500/40 bg-red-500/5"
                            : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                        )}
                    >
                        {/* Hardware Socket Top Tag */}
                        <div className={cn(
                        "w-15 h-5.5 bg-black rounded-b-md border-x border-b flex items-center justify-center -mt-3.5",
                        isSelected ? "border-orange-500" : "border-slate-700"
                        )}>
                        <span className="text-[10px] font-black text-slate-500">PON # {p}</span>
                        </div>

                        {/* Central Capacity Indicator */}
                        <div className="flex flex-col items-center leading-none mt-1">
                        <span className="text-sm font-black text-white">{stats?.total || 0}</span>
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mt-0.5">ONUs</span>
                        </div>

                        {/* --- DYNAMIC BOTTOM SFP HUD READOUT --- */}
                        {sfp ? (
                        <div className="w-full border-t border-white/5 pt-1.5 flex flex-col items-center gap-0.5 leading-none shrink-0">
                            <div className="flex items-center justify-between w-full text-[9px] font-mono font-bold">
                            <span className="text-slate-500">TX (op pwr):</span>
                            <span className={sfp.isHealthy ? "text-orange-400" : "text-red-500"}>{sfp.txPower}</span>
                            </div>
                            <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-500">
                            <span>TEMP:</span>
                            <span className="text-slate-400">{sfp.temp.replace("°C","")}° C</span>
                            </div>
                        </div>
                        ) : (
                        <div className="w-full h-2 bg-slate-800/40 rounded-full animate-pulse shrink-0" />
                        )}

                        {/* Port active connection bottom line glow */}
                        {stats?.total > 0 && sfp?.isHealthy && (
                        <div className="absolute bottom-0 h-0.5 w-8 bg-emerald-500 rounded-t-full shadow-[0_0_6px_#10b981]" />
                        )}
                    </button>
                    );
                })}
                </div>
              </div>
            )}

            {/* 2. DYNAMIC MAIN WORKSPACE CONTAINER */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/10 rounded-2xl border border-white/5 p-4">
              {!selectedOnu ? (
                <div className="space-y-4">
                  {/* Workspace Bar */}
                  <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-white/5 sticky top-0 backdrop-blur-xl z-20">
                     <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-orange-500" />
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Port {selectedPort} Active Subscriptions</h4>
                        {isBulkLoading && <Badge className="bg-orange-600 text-white animate-pulse border-none text-[8px] px-2.5 h-5 uppercase font-black">Laser Scan Active...</Badge>}
                     </div>
                     <div className="relative w-80">
                        <Search className="absolute left-4 top-3 h-3.5 w-3.5 text-slate-500" />
                        <Input 
                          placeholder="Filter current view metrics..." 
                          className="pl-11 h-10 bg-black/50 border-none rounded-xl text-white text-xs font-bold"
                          value={searchQuery}
                          onChange={(e)=>setSearchQuery(e.target.value)}
                        />
                     </div>
                  </div>

                  {/* Status Quick Filter Chips */}
                  <div className="flex flex-wrap gap-2 px-1">
                    {[
                      { label: "All Nodes", value: "ALL", color: "bg-slate-500" },
                      { label: "Operational", value: "Operational", color: "bg-emerald-500" },
                      { label: "Critical/Offline", value: "Offline", color: "bg-red-500" },
                    ].map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border flex items-center gap-2",
                          statusFilter === f.value 
                            ? "bg-white text-slate-950 border-white shadow-md" 
                            : "bg-transparent text-slate-400 border-slate-800 hover:border-slate-600"
                        )}
                      >
                        <div className={cn("h-1 w-1 rounded-full", f.color)} />
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Graphical Tile Card Grid Array */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                  {filteredOnus.map((onu, i) => {
                    const compositeKey = `${onu.port}/${onu.pon}`;
                    const power = powerData[compositeKey];
                    const phase = onuStates[compositeKey] || "working";
                    
                    const powerNumeric = power ? parseFloat(power) : null;
                    const isCritical = powerNumeric !== null && powerNumeric <= -27.00;
                    const isWarning = powerNumeric !== null && powerNumeric <= -24.00 && powerNumeric > -27.00;

                    // 🚀 FETCH CURRENT CONFIG BLOCK FROM TELEMETRY CACHE
                    const rawConfigText = onuConfigs[onu.pon] || "";
                    
                    /**
                     * 🎯 TARGET EXTRACTION 1: ACCOUNT DESCRIPTION MATCH
                     * Input:  "onu 1 desc 274966"
                     * Regex:  Looks for 'desc' followed by any non-whitespace string sequence
                     * Result: Groups[1] isolates exactly: "274966"
                     */
                    const descMatch = rawConfigText.match(/desc\s+(\S+)/i);
                    const extractedDesc = descMatch ? descMatch[1] : "No Desc";

                    /**
                     * 🎯 TARGET EXTRACTION 2: PROFILE LINE VALS MATCH
                     * Input:  "onu 1 profile line 312_319,1830,1831,1849,4060"
                     * Regex:  Looks for 'profile line' followed by the comma/underscore character string
                     * Result: Groups[1] isolates exactly: "312_319,1830,1831,1849,4060"
                     */
                    const lineMatch = rawConfigText.match(/profile\s+line\s+(\S+)/i);
                    const extractedLineProfile = lineMatch ? lineMatch[1] : "N/A";

                    return (
                        <div 
                        key={i} onClick={() => handleInspect(onu)}
                        className={cn(
                            "p-5 rounded-[2rem] border transition-all hover:scale-[1.02] active:scale-98 cursor-pointer group relative overflow-hidden bg-slate-900/30 border-slate-800/80 hover:border-orange-500/40"
                        )}
                        >
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-9 w-9 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                                <Server className="h-4 w-4 text-orange-500" />
                            </div>
                            
                            <Badge className={cn(
                            "text-[8px] font-black uppercase rounded-md px-2.5 h-5 border border-none tracking-widest",
                            phase === 'working' && "bg-emerald-500/10 text-emerald-400",
                            phase === 'ranging' && "bg-blue-500/10 text-blue-400 animate-pulse",
                            phase === 'popup' && "bg-amber-500/10 text-amber-400 animate-bounce",
                            phase === 'dyinggasp' && "bg-red-500/20 text-red-400 animate-pulse",
                            phase === 'offline' && "bg-red-500/10 text-red-500"
                            )}>
                            {phase === 'working' ? 'WORKING' : phase.toUpperCase()}
                            </Badge>
                        </div>
                        
                        {/* 🟢 EXACT VALUE DISPLAY 1: PURE ACCOUNT ID STRING */}
                        <div className="space-y-1 mb-4">
                            <div className="flex items-center justify-between w-full">
                                <h4 className="text-xs font-black text-white uppercase tracking-tight">ONU # {onu.pon}</h4>
                                <span 
                                className="text-[12px] font-mono font-black text-orange-400 bg-orange-500/5 px-2 py-0.5 rounded-lg max-w-[140px] truncate block border border-orange-500/10" 
                                title={extractedDesc}
                                >
                                Tel. No # {extractedDesc}
                                </span>
                            </div>
                            <p className="text-[12px] font-mono font-bold text-slate-500 uppercase tracking-tighter truncate">S/N: {onu.sn}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 relative z-10">
                            {/* 🟢 EXACT VALUE DISPLAY 2: CLEAN LIFECYCLE PROFILE VLAN MAP LINES */}
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5 flex flex-col justify-center overflow-hidden">
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-0.5">VLAN assigned</span>
                                <span 
                                className="text-[12px] font-mono font-black text-slate-300 truncate block tracking-tighter" 
                                title={extractedLineProfile}
                                >
                                {extractedLineProfile}
                                </span>
                            </div>
                            
                            <div className={cn("p-2 rounded-xl border flex flex-col justify-center", isCritical ? "bg-red-500/10 border-red-500/20" : isWarning ? "bg-amber-500/10 border-amber-500/20" : "bg-black/30 border-white/5")}>
                                <span className="text-[9px] font-black text-slate-500 uppercase">Optics Laser</span>
                                <span className={cn("text-[12px] font-mono font-black mt-0.5", isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-emerald-400")}>
                                {power || (isBulkLoading ? '...' : '--')}
                                </span>
                            </div>
                        </div>
                        </div>
                    )
                    })}
                  </div>
                </div>
              ) : (
                /* SERVICE PROFILE SUMMARY GRID */
                <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200 text-left pb-12">
                    <Button variant="ghost" onClick={() => setSelectedOnu(null)} className="text-slate-400 hover:text-white uppercase font-black text-xs px-2 h-8 mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Front Panel Map
                    </Button>
                    
                    {/* A. DEEP HARDWARE TELEMETRY CORE INSPECTOR */}
                    {loadingDiag ? (
                        <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 flex items-center justify-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Tracing hardware parameters over terminal path...</span>
                        </div>
                    ) : deepDiag ? (
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                            <Activity className="h-4 w-4 text-orange-500" />
                            <span className="text-xs font-black uppercase text-white tracking-widest">Active ONT Core Telemetry Diagnostic Trace</span>
                            </div>
                            <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[9px] font-black uppercase tracking-widest px-3 h-5">
                            ADMIN LINK: {deepDiag.adminStatus}
                            </Badge>
                        </div>

                        {/* Grid parameter matrices */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                                <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Laser Signal (Client Rx)</span>
                                <span className="text-sm font-mono font-black text-orange-400">{deepDiag.rxOnu}</span>
                            </div>
                            <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                                <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Laser Return (OLT Rx)</span>
                                <span className="text-sm font-mono font-black text-blue-400">{deepDiag.rxOlt}</span>
                            </div>
                            <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                                <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Transmission Level (Tx)</span>
                                <span className="text-sm font-mono font-black text-emerald-400">{deepDiag.txOnu}</span>
                            </div>
                            <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                                <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Physical Distance</span>
                                <span className="text-sm font-mono font-black text-white">{deepDiag.distance}</span>
                            </div>
                            <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                                <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Chassis Temperature</span>
                                <span className="text-xs font-mono font-black text-slate-300">{deepDiag.temperature}</span>
                            </div>
                            <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                                <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Total Engine Uptime</span>
                                <span className="text-[10px] font-mono font-black text-slate-400 truncate block">{deepDiag.uptime}</span>
                            </div>
                        </div>
                    </div>
                    ) : null}

                    {/* ✅ ✅ ✅ INSERTED RUNNING CONFIG CODE BOX WORKSPACE HERE */}
                    {onuConfigs && onuConfigs[selectedOnu?.pon] && !loadingServices && (
                    <div className="space-y-3 mt-6">
                        <div className="flex items-center gap-2 px-1">
                        <Terminal className="h-4 w-4 text-orange-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            ONT Running Database Blueprint (Port Context Loaded)
                        </span>
                        </div>
                        
                        <div className="bg-[#090a0f] border border-orange-500/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-lg text-[8px] font-black tracking-widest border border-orange-500/20 uppercase">
                            Chassis Cache Engine
                        </div>
                        
                        <pre className="font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre selection:bg-orange-500/20 selection:text-white scrollbar-thin">
                            {onuConfigs[selectedOnu.pon].split('\n').map((line: string, idx: number) => {
                            const isCommandRow = line.startsWith("onu add") || line.startsWith("onu ");
                            return (
                                <div key={idx} className="flex gap-4 hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                                <span className="text-slate-600 select-none text-right w-6 font-bold">{idx + 1}</span>
                                <span className={cn(
                                    isCommandRow ? "text-slate-200" : "text-slate-400 italic",
                                    line.includes("desc") && "text-blue-400 font-bold",
                                    line.includes("line") && "text-amber-400 font-bold"
                                )}>
                                    {line}
                                </span>
                                </div>
                            );
                            })}
                        </pre>
                        </div>
                    </div>
                    )}

                    {/* B. VIRTUAL NETWORK CONFIG SERVICE PROFILE CONTAINER */}
                    <div className="space-y-4 mt-8">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block ml-2">Mapped VLAN Bridges</span>
                        {loadingServices ? (
                        <div className="py-20 text-center">
                            <Loader2 className="animate-spin h-8 w-8 mx-auto text-orange-500 mb-3" />
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Decoding Service Stack...</p>
                        </div>
                        ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {serviceCards.map((svc, i) => (
                            <div key={i} className="bg-slate-900 border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                <Badge className="bg-orange-500 text-white border-none uppercase text-[9px] px-3 py-0.5 rounded-md font-black">{svc.type}</Badge>
                                <span className="text-[9px] font-black text-slate-500 uppercase">UNI Node: {svc.uni}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-[8px] font-black text-slate-500 uppercase block mb-0.5">Link State</span><p className="text-xs font-black text-emerald-400">{svc.state}</p></div>
                                <div><span className="text-[8px] font-black text-slate-500 uppercase block mb-0.5">S-VLAN TAG</span><p className="text-xs font-black text-white">#{svc.vlan}</p></div>
                                <div className="col-span-2"><span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Configuration Profile</span><p className="text-[10px] font-mono font-bold text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/5 truncate">{svc.profile}</p></div>
                                </div>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 flex-1 bg-[#0c0c0c] overflow-y-auto">
             <pre className="text-emerald-500 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">{rawConsole}</pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
