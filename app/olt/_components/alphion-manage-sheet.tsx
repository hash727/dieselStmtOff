// app/olt/_components/olt-manage-sheet.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getNetlinkOnuPower, getOltOnuDetails, getOltPowerDetails, getOnuServices } from "@/app/actions/olt-management";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, RefreshCw, Terminal, Search, 
  Users, Cpu, Server, ShieldAlert, BarChart3, 
  ArrowLeft,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { exportAlphionInventoryToExcel } from "@/lib/alphion-olt-report";

export function AlphionOltManageSheet({ olt, isOpen, onOpenChange }: any) {
  const [loading, setLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  
  // --- TELEMETRY STATE POOLS ---
  const [onuData, setOnuData] = useState<any[]>([]);
  const [powerData, setPowerMap] = useState<Record<string, string>>({});
  const [onuConfigs, setOnuConfigs] = useState<Record<string, string>>({});
  const [serviceCards, setServiceCards] = useState<any[]>([]);
  
  // --- UI COORDINATES ---
  const [rawConsole, setRawConsole] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedPon, setSelectedPon] = useState<string | null>(null);
  const [selectedOnu, setSelectedOnu] = useState<any | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");

  // --- AUTOMATED RESET EXTRACTOR HOOK ON SWITCHING ---
  useEffect(() => {
    if (isOpen && olt?.id) {
      setOnuData([]);
      setPowerMap({});
      setOnuConfigs({});
      setServiceCards([]);
      setRawConsole("");
      setSearchQuery("");
      setSelectedCard(null);
      setSelectedPon(null);
      setSelectedOnu(null);
      setStatusFilter("ALL");
      fetchLiveDetails();
    }
  }, [isOpen, olt?.id]);

  // --- 1. CORE SYNC (ONU List) ---
  const fetchLiveDetails = async () => {
    setLoading(true);
    setPowerMap({}); 
    try {
      const res = await getOltOnuDetails(olt.id);
      if (res && res.success) {
        const result = res as { data: any[]; raw: string };
        const fetchedDataset = result.data || [];
        setOnuData(fetchedDataset);
        setRawConsole(result.raw || "");
        toast.success("Inventory Synchronized");

        if (fetchedDataset.length > 0) {
          const firstCardId = fetchedDataset[0].pon.split('/')[0];
          setSelectedCard(firstCardId);
        }
      }
    } catch (error) {
      toast.error("NOC Bridge Timeout");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. AUTOMATED BULK POWER FETCH ---
  const fetchPowerForEntireCard = async (cardId: string) => {
    if (!onuData.length) return;
    setIsBulkLoading(true);

    const cardPorts = Array.from(
      new Set(onuData.filter(o => o.pon.startsWith(`${cardId}/`)).map(o => o.pon))
    ).sort();

    toast.info(`Scanning optics for Slot ${cardId}...`);

    try {
      switch (olt?.make?.toUpperCase()) {
        case "ALPHION":
          for (const port of cardPorts) {
            const res = await getOltPowerDetails(olt.id, port);
            if (res.success && typeof res.data === 'object') {
              setPowerMap(prev => ({ ...prev, ...(res.data as Record<string, string>) }));
            }
          }
          break;
        
        case "NETLINK":
          for (const onu of filteredOnus) {
            const portId = selectedCard; 
            const onuId = onu.pon;      
            const res = await getNetlinkOnuPower(olt.id, portId as string, onuId);
            if (res.success && res.data && typeof res.data === 'object') {
              const powerInfo = res.data as Record<string, string>; 
              setPowerMap(prev => ({ ...prev, ...powerInfo }));
            }
          }
          break;
        
        default:
          break;
      }
    } catch (err) {
      console.error("Bulk power fetch encountered an error", err);
    } finally {
      setIsBulkLoading(false);
      toast.success(`Slot ${cardId} telemetry updated`);
    }
  };

  // --- 3. DATA GROUPING LOGIC ---
  const groupedByCard = useMemo(() => {
    const groups: Record<string, { items: any[]; online: number; offline: number; lowSignal: boolean }> = {};
    onuData.forEach(onu => {
      const cardId = onu.pon.split('/')[0];
      if (!groups[cardId]) {
        groups[cardId] = { items: [], online: 0, offline: 0, lowSignal: false };
      }
      groups[cardId].items.push(onu);
      if (onu.status === 'Operational' || onu.status === 'Online' || onu.status === 'Active') {
        groups[cardId].online++;
      } else {
        groups[cardId].offline++;
      }

      const signal = powerData[onu.pon];
      if (signal && parseFloat(signal) <= -27) groups[cardId].lowSignal = true;
    });
    return groups;
  }, [onuData, powerData]);

  const cards = Object.keys(groupedByCard).sort((a, b) => Number(a) - Number(b));

  // --- 4. FILTERING ---
  const filteredOnus = useMemo(() => {
    const list = selectedCard ? groupedByCard[selectedCard]?.items || [] : [];
    return list.filter(onu => {
      const matchesSearch = onu.sn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           onu.account?.toString().includes(searchQuery) ||
                           onu.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPort = selectedPon ? onu.pon === selectedPon : true;
      const matchesStatus = statusFilter === "ALL" ? true : onu.status === statusFilter;

      return matchesSearch && matchesPort && matchesStatus;
    });
  }, [selectedCard, groupedByCard, searchQuery, selectedPon, statusFilter]);

  // --- 5. INTERACTIVE SERVICE CARD CONFIG EXTRACTION ---
  const handleOnuClick = async (onu: any) => {
    setSelectedOnu(onu);
    setLoadingServices(true);
    try {
      const res = await getOnuServices(olt.id, onu.pon);
      if (res.success && res.data) {
        const resultData = res as { data: any[]; runningConfig?: string };
        setServiceCards(resultData.data);
        if (resultData.runningConfig) {
          setOnuConfigs(prev => ({ ...prev, [onu.pon]: resultData.runningConfig || "" }));
        }
      }
    } catch (e) { 
      toast.error("Service Fetch Failed"); 
    } finally { 
      setLoadingServices(false); 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw]! w-[98vw] h-[96vh] p-0 gap-0 overflow-hidden bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-xl">
        
        {/* TOP PANEL HUD HEADER */}
        <div className="h-14 px-5 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded border border-blue-500/20 shadow-sm">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                {olt?.make || "SYSTEM"} <span className="text-[10px] font-medium text-slate-400 lowercase border-l pl-2 border-slate-200 dark:border-zinc-700">nms structural diagnostics control</span>
              </DialogTitle>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span className="font-semibold">{olt?.name}</span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span>INTERFACE NODE IP: {olt?.ip || "0.0.0.0"}</span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span>OUTER TAG: VLAN {olt?.outerVlan || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-slate-100 dark:bg-zinc-950 p-0.5 rounded border border-slate-200 dark:border-zinc-800 flex gap-0.5">
                <Button size="sm" variant={viewMode === 'table' ? 'secondary' : 'ghost'} onClick={() => setViewMode('table')} className={cn("h-7 px-3 text-[10px] uppercase font-bold rounded", viewMode === 'table' ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-zinc-700" : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100")}>Explorer Map</Button>
                <Button size="sm" variant={viewMode === 'raw' ? 'secondary' : 'ghost'} onClick={() => setViewMode('raw')} className={cn("h-7 px-3 text-[10px] uppercase font-bold rounded", viewMode === 'raw' ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-zinc-700" : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100")}>CLI Engine</Button>
             </div>
             <Button onClick={fetchLiveDetails} disabled={loading || isBulkLoading} variant="outline" className="h-8 px-4 border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] uppercase rounded transition-colors">
               {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />} 
               Sync Core
             </Button>
          </div>
        </div>

        {/* WORKSPACE PANE SPLIT SCREEN */}
        <div className="flex flex-1 overflow-hidden h-full bg-slate-50 dark:bg-zinc-950">
          
          {/* 🔴 LEFT SIDEBAR: VERTICAL PORT STACK SELECTOR */}
          <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 p-3 gap-2 overflow-y-auto custom-scrollbar">
            <div className="p-1 flex items-center justify-between">
               <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Slots & Interfaces</span>
               <BarChart3 className="h-3 w-3 text-slate-300" />
            </div>
            
            <div className="flex flex-col gap-2">
              {cards.map((card) => {
                const stats = groupedByCard[card];
                const isActive = selectedCard === card;
                const total = stats.items.length;
                const uptime = total > 0 ? Math.round((stats.online / total) * 100) : 0;
                const subPorts = Array.from(new Set(stats.items.map(i => i.pon))).sort();

                return (
                  <div key={card} className="flex flex-col gap-1">
                    <button
                      onClick={() => { 
                        setSelectedCard(card); 
                        setSelectedOnu(null); 
                        setSelectedPon(null);
                        fetchPowerForEntireCard(card); 
                      }}
                      className={cn(
                        "cursor-pointer w-full flex flex-col gap-2 p-3 rounded border text-left transition-all relative group active:scale-[0.99]",
                        "hover:border-purple-500/80 transition-colors duration-150",
                        isActive ? "bg-blue-600/3 border-blue-500 dark:border-blue-400 shadow-sm" : "bg-transparent border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      {stats.lowSignal && (
                        <ShieldAlert className="absolute -top-2 -right-1 h-4 w-4 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_#f59e0b]" />
                      )}
                      
                      <div className="flex items-center justify-between w-full text-[11px]">
                        <div className="flex items-center gap-2">
                           <Server className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-slate-400")} />
                           <span className="font-bold text-slate-800 dark:text-zinc-200">PON {card}</span>
                        </div>
                        <span className="text-[9px] font-mono font-semibold text-slate-400">{uptime}%</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-[10px] mt-0.5">
                         <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 p-1 rounded flex items-center justify-between px-2">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">ON</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{stats.online}</span>
                         </div>
                         <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 p-1 rounded flex items-center justify-between px-2">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">OFF</span>
                            <span className="font-mono font-bold text-red-500">{stats.offline}</span>
                         </div>
                      </div>

                      <div className="w-full h-0.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex mt-1">
                        <div className="h-full bg-emerald-500" style={{ width: `${uptime}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${100 - uptime}%` }} />
                      </div>
                    </button>

                    {/* INTERFACE CHIP SUB-CHANNELS NAVIGATION */}
                    {isActive && subPorts.length > 1 && (
                      <div className="flex flex-col gap-0.5 pl-3 pr-1 py-1 border-l border-slate-100 dark:border-zinc-800 ml-4 animate-in slide-in-from-top-1 duration-150">
                        {subPorts.map(p => (
                          <button 
                            key={p} 
                            onClick={() => {
                              setSelectedPon(p);
                              setSelectedOnu(null);
                            }}
                            className={cn(
                              "cursor-pointer w-full text-left px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-tight transition-all flex items-center justify-between border", 
                              selectedPon === p ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-transparent" : "bg-transparent border-transparent text-slate-700 hover:text-slate-300 hover:bg-slate-900 dark:hover:text-zinc-900 dark:hover:bg-zinc-400"
                            )}
                          >
                            <span>ONU {p}</span>
                            {selectedPon === p && <div className="h-1 w-1 rounded-full bg-blue-600 animate-pulse" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* 🟢 RIGHT PANEL: HIGH-DENSITY SPREADSHEET ROW MATRIX */}
          <main className="flex-1 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
            {viewMode === "table" ? (
              <>
                {/* SUBHEADER QUICK CONTROLLER ACTION BAR */}
                <div className="h-12 px-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
                  <div className="flex items-center gap-2">
                    {selectedOnu ? (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOnu(null)} className="h-7 px-2 uppercase font-bold text-[10px] border dark:border-zinc-800">
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Return to Sheet List
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {selectedPon ? `Interface Channel: ${selectedPon}` : `Slot Module ${selectedCard || '?'}`} Inventory Summary
                        </h4>
                        {isBulkLoading && <span className="text-[8px] font-black text-blue-500 uppercase animate-pulse">Laser Sweep Syncing...</span>}
                      </div>
                    )}
                  </div>

                  {!selectedOnu && (
                    <div className="flex items-center gap-3">
                      {isBulkLoading ? (
                        <span className="text-[8px] font-black text-blue-500 uppercase animate-pulse">Export...</span>
                        ) : (
                          <>
                            {/* ✅ ALPHION REFINEMENT ACTION EXPORT EXCEL LINK CHIP */}
                            {filteredOnus.length > 0 && !selectedOnu && (
                              <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportAlphionInventoryToExcel(olt.name, olt.ip, selectedCard!, selectedPon, filteredOnus, powerData)}
                              className="h-8 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase rounded flex items-center gap-1.5 transition-colors"
                              >
                              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                              Export Slot Data
                              </Button>
                            )}
                          </>
                        )
                      }
                      <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          placeholder="Search SN, Account ID or Name..."
                          className="pl-9 h-8 border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-xs font-medium focus-visible:ring-1 focus-visible:ring-blue-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* TABULAR ROW SHEET CANVAS */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/20">
                  {!selectedOnu ? (
                    <div className="space-y-4">
                      {/* STATUS CHIP QUICK FILTERS */}
                      <div className="flex flex-wrap gap-1.5 px-0.5">
                        {[
                          { label: "All Nodes", value: "ALL", color: "bg-slate-500" },
                          { label: "Operational", value: "Operational", color: "bg-emerald-500" },
                          { label: "Ranging (RA)", value: "Ranging", color: "bg-blue-500" },
                          { label: "Popup (PO)", value: "Popup", color: "bg-amber-500" },
                          { label: "Critical/Offline", value: "Offline", color: "bg-red-500" },
                        ].map((f) => (
                          <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            className={cn(
                              "px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all border flex items-center gap-1.5",
                              statusFilter === f.value
                                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                                : "bg-white dark:bg-zinc-900 text-slate-500 border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                            )}
                          >
                            <div className={cn("h-1 w-1 rounded-full", f.color)} />
                            {f.label}
                            {/* Optional: Show count for each status */}
                            <span className="opacity-40 ml-1">
                                ({(selectedCard ? groupedByCard[selectedCard]?.items : []).filter(o => f.value === 'ALL' ? true : o.status === f.value).length})
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* SPREADSHEET ROW TABLE FRAME */}
                      <div className="rounded border border-slate-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 h-9 text-[9px] font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider select-none">
                              <th className="px-4 font-bold ">Port ID</th>
                              <th className="px-4 font-bold ">Link State</th>
                              <th className="px-4 font-bold ">Subscriber account</th>
                              <th className="px-4 font-bold">Serial No.</th>
                              <th className="px-4 font-bold">ont Model</th>
                              <th className="px-4 font-bold text-center">OPM Laser (Rx)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                            {filteredOnus.map((onu, idx) => {
                              const power = powerData[onu.pon];
                              const powerNumeric = power ? parseFloat(power) : null;
                              const isCritical = powerNumeric !== null && powerNumeric <= -27.00;
                              const isWarning = powerNumeric !== null && powerNumeric <= -24.00 && powerNumeric > -27.00;

                              // Extract script details on the fly
                              const rawConfigText = onuConfigs[onu.pon] || "";
                              const descMatch = rawConfigText.match(/desc\s+(\S+)/i);
                              const accountDesc = descMatch ? descMatch[1] : onu.account || `ONU-${onu.pon}`;

                              return (
                                <tr 
                                  key={idx} 
                                  onClick={() => handleOnuClick(onu)}
                                  className="h-10 text-[12px] hover:bg-slate-300/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                                >
                                  <td className="px-4 font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">{onu.pon}</td>
                                  <td className="px-4">
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>

                                                <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                        "text-[9px] font-black uppercase border-none px-3 py-1 rounded-full",
                                                        // COLOR MAPPING
                                                        onu.status === 'Operational' && "bg-emerald-500/10 text-emerald-500",
                                                        onu.status === 'Popup' && "bg-amber-500/10 text-amber-500 animate-pulse",
                                                        onu.status === 'Ranging' && "bg-blue-500/10 text-blue-500 animate-pulse",
                                                        onu.status === 'Pre-Provision' && "bg-slate-500/10 text-slate-500",
                                                        onu.status === 'Offline' && "bg-red-500/10 text-red-500",
                                                        onu.status === 'Emergency Stop' && "bg-black text-white"
                                                    )}
                                                >
                                                    {/* Display short code for space efficiency */}
                                                    {onu.status === 'Operational' && 'OP'}
                                                    {onu.status === 'Popup' && 'PO'}
                                                    {onu.status === 'Ranging' && 'RA'}
                                                    {onu.status === 'Pre-Provision' && 'PR'}
                                                    {onu.status === 'Offline' && 'OFF'}
                                                    {onu.status === 'Emergency Stop' && 'EM'}
                                                </Badge>
                                            </TooltipTrigger>

                                            <TooltipContent side="top" className="bg-slate-900 text-white border-zinc-800 rounded-xl p-3">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[10px] font-black uppercase text-blue-400">ONT State Definition</p>
                                                    <p className="text-xs font-bold">{onu.status}</p>
                                                    <p className="text-[9px] text-slate-400 max-w-[150px] leading-tight mt-1">
                                                        {onu.status === 'Operational' && "Stable connection. Traffic flowing."}
                                                        {onu.status === 'Popup' && "Attempting re-sync. Check for loose physical connectors."}
                                                        {onu.status === 'Ranging' && "Measuring distance. Often indicates high fiber attenuation."}
                                                        {onu.status === 'Pre-Provision' && "Serial detected but not configured in OLT DB."}
                                                        {onu.status === 'Emergency Stop' && "ONU disabled by administrator or OLT logic."}
                                                        {onu.status === 'Offline' && "No signal detected. Likely power loss or fiber cut."}
                                                    </p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                  </td>
                                  <td className="px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                                     <span className="bg-purple-500/3 px-2 py-0.5 rounded border border-purple-500/10 block w-fit">
                                       {accountDesc}
                                     </span>
                                  </td>
                                  <td className="px-4 font-mono text-slate-800 dark:text-slate-500 uppercase tracking-tight">{onu.sn}</td>
                                  <td className="px-4 font-semibold text-slate-600 dark:text-slate-400 uppercase truncate max-w-[160px]">{onu.name}</td>
                                  <td className="px-4 text-center">
                                    <span className={cn(
                                      "font-mono font-bold px-1.5 py-0.5 rounded border",
                                      !power ? "text-slate-300 dark:text-zinc-700 bg-transparent border-transparent" :
                                      isCritical ? "text-red-600 bg-red-500/10 border-red-500/20" : 
                                      isWarning ? "text-amber-600 bg-amber-500/10 border-amber-500/20" : 
                                      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
                                    )}>
                                      {power || '--'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* DYNAMIC PROFILE UNIS CHANNELS INSPECTION CARD */
                    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-200 text-left pb-8">
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded space-y-4 shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b pb-2 dark:border-zinc-800">
                           Subscriber Mapped VLAN Services Bridges
                        </span>
                        
                        {loadingServices ? (
                          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                            <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider animate-pulse">Reading virtual layer data tags...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {serviceCards.map((svc, i) => (
                              <div key={i} className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded p-4 relative overflow-hidden flex flex-col justify-between shadow-inner">
                                <div className="flex justify-between items-center mb-3">
                                  <Badge className="bg-blue-600 text-white border-none uppercase text-[9px] font-bold px-2 rounded py-0.5">{svc.type}</Badge>
                                  <span className="text-[9px] font-mono font-semibold text-slate-400">UNI: {svc.uni}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] mt-1">
                                   <div><span className="text-[8px] font-bold text-slate-400 uppercase block">State</span><p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{svc.state}</p></div>
                                   <div><span className="text-[8px] font-bold text-slate-400 uppercase block">S-VLAN ID</span><p className="text-xs font-mono font-bold text-blue-600">#{svc.vlan}</p></div>
                                   <div className="col-span-2 mt-1"><span className="text-[8px] font-bold text-slate-400 uppercase block">Bandwidth Profile Assignment</span><p className="text-[10px] font-mono font-bold text-slate-500 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-2 rounded truncate mt-1">{svc.profile}</p></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-5 flex-1 bg-black/95 overflow-y-auto">
                 <pre className="text-emerald-500 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">{rawConsole || "Direct output prompt session buffer empty."}</pre>
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
