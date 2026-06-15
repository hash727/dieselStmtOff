// app/olt/_components/olt-manage-sheet.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getNetlinkOnuPower, getOltOnuDetails, getOltPowerDetails, getOnuServices } from "@/app/actions/olt-management";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, RefreshCw, Terminal, LayoutList, Search, 
  ChevronRight, Users, Cpu, Server, ShieldAlert, BarChart3, Zap, 
  ArrowLeft,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { exportAlphionInventoryToExcel } from "@/lib/alphion-olt-report";

export function OltManageSheet({ olt, isOpen, onOpenChange }: any) {
  const [loading, setLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [onuData, setOnuData] = useState<any[]>([]);
  const [powerData, setPowerMap] = useState<Record<string, string>>({});
  const [onuStates, setOnuStates] = useState<Record<string, string>>({});
  const [onuConfigs, setOnuConfigs] = useState<Record<string, string>>({});

  const [rawConsole, setRawConsole] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedPon, setSelectedPon] = useState<string | null>(null);

  const [serviceCards, setServiceCards] = useState<any[]>([]);
  const [selectedOnu, setSelectedOnu] = useState<any | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL")

  // =========================================================================
  // 🚀 ✅ CRITICAL FIX: DYNAMIC COMPONENT LIFECYCLE REFRESH WORKER HOOK
  // Triggered instantly when sheet opens or whenever a different OLT is clicked
  // =========================================================================
  useEffect(() => {
    if (isOpen && olt?.id) {
      console.log(`[NOC LAYER] Context shifting active target to OLT: ${olt.name} (${olt.ip})`);
      
      // 🧼 Phase A: Total Cache Flush to completely eliminate ghost state rows
      setOnuData([]);
      setPowerMap({});
      setOnuStates({});
      setOnuConfigs({});
      setServiceCards([]);
      setRawConsole("");
      setSearchQuery("");
      setSelectedCard(null);
      setSelectedPon(null);
      setSelectedOnu(null);
      setStatusFilter("ALL");

      // 🔄 Phase B: Automatically execute a fresh baseline background retrieval
      fetchLiveDetails();
    }
  }, [isOpen, olt?.id]); // Deep link monitors active sheet triggers

  // --- 1. CORE SYNC (ONU List) ---
  const fetchLiveDetails = async () => {
    setLoading(true);
    setPowerMap({}); // Clear old optics on new sync
    try {
      const res = await getOltOnuDetails(olt.id);
      if (res && res.success) {
        const result = res as { data: any[]; raw: string };
        const fetchedDataset = result.data || [];

        setOnuData(fetchedDataset);
        setRawConsole(result.raw || "");
        toast.success(`${olt?.make} Diagnostics Inventory Synced`);

        // Automatically focus on the first available Slot index card for high-density setups
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

    // Identify unique ports in this card (e.g. 1/1, 1/2)
    const cardPorts = Array.from(
      new Set(onuData.filter(o => o.pon.startsWith(`${cardId}/`)).map(o => o.pon))
    ).sort();

    toast.info(`Scanning optics for Slot ${cardId}...`);

    try {

        switch(olt.make){
          case "ALPHION":
            for (const port of cardPorts) {
              const res = await getOltPowerDetails(olt.id, port);
              if (res.success && typeof res.data === 'object') {
                // Merge results into state as they arrive
                setPowerMap(prev => ({ ...prev, ...(res.data as Record<string, string>) }));
              }
            }
            break;
          
          case "NETLINK":
            for(const onu of filteredOnus){
              const portId = selectedCard; // The card/port number from sidebar
              const onuId = onu.pon;      // The actual ONU index (1, 2, 3...)
              const res = await getNetlinkOnuPower(olt.id, portId as string, onuId)
              if(res.success && res.data && typeof res.data === 'object'){
                const powerInfo = res.data as Record<string, string>; // Explicit cast
                setPowerMap(prev => ({ 
                  ...prev, 
                  ...powerInfo 
                }));
              }
            }
            break;
          
          default:
            break;
        }
      } catch (err) {
        // console.error(`Port ${port} scan failed`);
        console.error("Bulk power fetch encountered an error", err);
      } finally {
        setIsBulkLoading(false);
        toast.success(`Slot ${cardId} telemetry updated`)

      }
    }

  // --- 3. DATA GROUPING LOGIC ---
  const groupedByCard = useMemo(() => {
    const groups: Record<string, { items: any[]; online: number; offline: number; lowSignal: boolean }> = {};
    onuData.forEach(onu => {
      const cardId = onu.pon.split('/')[0];
      if (!groups[cardId]) {
        groups[cardId] = { items: [], online: 0, offline: 0, lowSignal: false };
      }
      groups[cardId].items.push(onu);
      if (onu.status === 'Operational') groups[cardId].online++;
      else groups[cardId].offline++;

      // Trigger Alert if any ONU in this card has power worse than -27
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

      // NEW: Status Filter Logic
      const matchesStatus = statusFilter === "ALL" ? true : onu.status === statusFilter;

      return matchesSearch && matchesPort&&matchesStatus;
    });
  }, [selectedCard, groupedByCard, searchQuery, selectedPon, statusFilter]);

 

  // --- 5. INTERACTIVE SERVICE CARD DISPLAY INSIDERS ---
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
      toast.error("VLAN configuration bridge query failed"); 
    } finally { 
      setLoadingServices(false); 
    }
  };

  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw]! w-[98vw] h-[96vh] p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-none shadow-2xl rounded-3xl">
        
        {/* TOP HUD */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20"><Cpu className="h-5 w-5" /></div>
            <DialogTitle className="text-lg font-black uppercase tracking-tighter">
              {olt?.name} <span className="text-slate-400 mx-2 font-light">/</span> System Operations
            </DialogTitle>
          </div>

          <div className="flex items-center gap-3 mr-2.5">
             <div className="bg-slate-200/50 dark:bg-zinc-800 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-zinc-700">
                <Button size="sm" variant={viewMode === 'table' ? 'secondary' : 'ghost'} onClick={() => setViewMode('table')} className="h-7 px-4 text-[10px] uppercase font-black">Explorer</Button>
                <Button size="sm" variant={viewMode === 'raw' ? 'secondary' : 'ghost'} onClick={() => setViewMode('raw')} className="h-7 px-4 text-[10px] uppercase font-black">Raw CLI</Button>
             </div>
             <Button onClick={fetchLiveDetails} disabled={loading || isBulkLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] h-9 px-6 rounded-lg uppercase">
               {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />} 
               Sync Inventory
             </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden h-full">
          
          {/* SIDEBAR */}
          <aside className="w-72 border-r bg-slate-50/30 dark:bg-zinc-900/20 flex flex-col shrink-0">
            <div className="p-4 border-b bg-white/50 dark:bg-zinc-900/50 flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Slots & Interfaces</span>
               <BarChart3 className="h-3.5 w-3.5 text-slate-300" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {cards.map((card) => {
                const stats = groupedByCard[card];
                const isActive = selectedCard === card;
                const total = stats.items.length;
                const uptime = total > 0 ? Math.round((stats.online / stats.items.length) * 100) : 0;
                const ports = Array.from(new Set(stats.items.map(i => i.pon))).sort();

                return (
                  <div key={card} className="flex flex-col gap-1">
                    <button
                      onClick={() => { 
                        setSelectedCard(card); 
                        setSelectedPon(null); 
                        setSelectedOnu(null);
                        fetchPowerForEntireCard(card); 
                      }}
                      className={cn(
                        "w-full flex flex-col gap-3 px-4 py-4 rounded-2xl transition-all text-left border relative",
                        isActive ? "bg-slate-900 border-slate-800 text-white shadow-xl" : "bg-white dark:bg-zinc-900 border-slate-100"
                      )}
                    >
                      {stats.lowSignal && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                          <ShieldAlert className="h-3 w-3 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                           <Server className={cn("h-4 w-4", isActive ? "text-blue-400" : "text-slate-400")} />
                           <span className="text-xs font-black uppercase">PON {card}</span>
                        </div>
                        <span className="text-[9px] font-black">{uptime}% UP</span>
                      </div>

                      <div className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${uptime}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${100 - uptime}%` }} />
                      </div>
                    </button>

                    {isActive && (
                      <div className="flex flex-col gap-1 px-2 pt-1 animate-in slide-in-from-top-2">
                        {ports.map(p => (
                          <button 
                            key={p} 
                            onClick={() => {
                              setSelectedPon(p)
                              setSelectedOnu(null)
                            }}
                            className={cn("w-full text-left px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-between border", selectedPon === p ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40" : "text-slate-400 hover:bg-slate-100")}
                          >
                            <span>Ont {p}</span>
                            {selectedPon === p && <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* MAIN TABLE */}
          <main className="flex-1 bg-white dark:bg-zinc-950 flex flex-col overflow-hidden">
            {viewMode === "table" ? (
              <>
                <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-zinc-950 z-10 sticky top-0 shrink-0">
                
                  <div className="flex items-center gap-3">
                    {selectedOnu ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={()=>setSelectedOnu(null)} 
                        className="h-8 px-2 uppercase font-black text-[10px]"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2"/> Back
                      </Button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm font-black uppercase tracking-tight leading-none">
                            {selectedPon ? `Port ${selectedPon}` : `Slot ${selectedCard || '?'}`} Inventory
                          </h4>
                          {isBulkLoading && <span className="text-[8px] font-black text-blue-500 uppercase animate-pulse">Syncing Optics...</span>}
                        </div>
                      </div>
                    )}
                    
                  </div>
                  {!selectedOnu && (
                    <div className="flex items-center gap-3">
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
                        <div className="relative w-[400px]">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search SN, Account or Name..."
                            className="pl-10 h-9 bg-slate-50 dark:bg-zinc-900 border-none rounded-xl text-xs font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                </div>

                   {/* <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <h4 className="text-sm font-black uppercase tracking-tight">PON {selectedCard} Details</h4>
                      {isBulkLoading && <Badge className="bg-blue-50 text-blue-600 border-blue-100 animate-pulse">Scanning Optics...</Badge>}
                   </div>
                   <div className="relative w-[400px]">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input placeholder="Search records..." className="pl-10 h-9 bg-slate-50 dark:bg-zinc-900 border-none rounded-xl text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                   </div> */}
                   
                   
                

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {!selectedOnu? (
                  <div className="space-y-6">
                    {/* STATUS QUICK FILTERS */}
                    <div className="flex flex-wrap gap-2 mb-4 px-1">
                      {[
                        { label: "All Nodes", value: "ALL", color: "bg-slate-500" },
                        { label: "Operational", value: "Operational", color: "bg-emerald-500" },
                        { label: "Ranging (RA)", value: "Ranging", color: "bg-blue-500" },
                        { label: "Popup (PO)", value: "Popup", color: "bg-amber-500" },
                        { label: "Pre-Provision", value: "Pre-Provision", color: "bg-slate-400" },
                        { label: "Critical/Offline", value: "Offline", color: "bg-red-500" },
                      ].map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setStatusFilter(f.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border flex items-center gap-2",
                            statusFilter === f.value 
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900" 
                              : "bg-white dark:bg-zinc-900 text-slate-500 border-slate-100 dark:border-zinc-800 hover:border-slate-300"
                          )}
                        >
                          <div className={cn("h-1.5 w-1.5 rounded-full", f.color)} />
                          {f.label}
                          {/* Optional: Show count for each status */}
                          <span className="opacity-40 ml-1">
                            ({(selectedCard ? groupedByCard[selectedCard]?.items : []).filter(o => f.value === 'ALL' ? true : o.status === f.value).length})
                          </span>
                        </button>
                      ))}
                    </div>                  
                
                  <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm bg-white dark:bg-zinc-900">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-zinc-800">
                        <TableRow>
                          <TableHead className="text-[10px] font-black uppercase px-8 h-12">PON</TableHead>
                          <TableHead className="text-[10px] font-black uppercase px-8 h-12">Number</TableHead>
                          <TableHead className="text-[10px] font-black uppercase h-12">Serial No</TableHead>
                          <TableHead className="text-[10px] font-black uppercase h-12">ONT Version</TableHead>
                          <TableHead className="text-[10px] font-black uppercase h-12 text-center">Optics (Rx)</TableHead>
                          <TableHead className="text-[10px] font-black uppercase h-12 text-right px-8">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOnus.map((onu, idx) => (
                          <TableRow key={idx} 
                            onClick={() => handleOnuClick(onu)}
                            className="hover:bg-blue-50/30 border-b border-slate-100 dark:border-zinc-800">
                            <TableCell className="px-8 py-4 font-mono text-[11px] font-black text-blue-600">{onu.pon}</TableCell>
                            <TableCell className="font-mono text-[11px] font-bold uppercase">{onu.account}</TableCell>
                            <TableCell className="font-mono text-[11px] font-bold uppercase">{onu.sn}</TableCell>
                            <TableCell className="font-mono text-[11px] font-bold uppercase">{onu.name}</TableCell>
                            <TableCell className="text-center">
                              {powerData[onu.pon] ? (
                                <span className={cn("font-mono text-[11px] font-black px-2 py-0.5 rounded", parseFloat(powerData[onu.pon]) <= -27 ? "bg-red-100 text-red-700" : parseFloat(powerData[onu.pon]) <= -24 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                                  {powerData[onu.pon]}
                                </span>
                              ) : isBulkLoading ? <Loader2 className="h-3 w-3 animate-spin mx-auto text-slate-300" /> : <span className="text-[10px] text-slate-300">--</span>}
                            </TableCell>
                            <TableCell className="text-right px-8">
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

                                    <TooltipContent side="left" className="bg-slate-900 text-white border-zinc-800 rounded-xl p-3">
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
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                   </div>
                  </div>
                  ): (
                    /* SERVICE CARD GRID */
                    <div className="space-y-6">
                      {loadingServices ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4"><Loader2 className="h-10 w-10 animate-spin text-blue-500"/><p className="text-[10px] font-black uppercase text-slate-400">Interrogating ONU Services...</p></div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-300">
                          {serviceCards.map((svc, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:border-blue-500 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                <Badge className={cn("uppercase text-[9px] font-black px-2.5 py-1 rounded-full border-none", svc.type==='hsi'?"bg-blue-500":svc.type==='voip'?"bg-emerald-500":"bg-slate-500")}>{svc.type}</Badge>
                                <span className="text-[10px] font-mono font-bold text-slate-400">{svc.uni}</span>
                              </div>
                              <div className="space-y-2.5">
                                <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Status</span><span className={cn("text-[10px] font-black uppercase", svc.state==='Activated'?"text-emerald-500":"text-red-500")}>{svc.state}</span></div>
                                <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">VLAN ID</span><span className="text-xs font-mono font-black text-blue-600">#{svc.vlan}</span></div>
                                {svc.bwMax && <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Max Speed</span><span className="text-xs font-bold">{Math.round(parseInt(svc.bwMax)/1024)} Mbps</span></div>}
                                <div className="pt-2 mt-2 border-t border-slate-50 dark:border-zinc-800"><span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Profile</span><p className="text-[10px] font-mono font-bold text-slate-500 break-all bg-slate-50 dark:bg-zinc-950 p-2 rounded-xl">{svc.profile}</p></div>
                                {svc.phone && <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/><span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">Line: {svc.phone}</span></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full bg-[#0c0c0c] p-8 overflow-y-auto"><pre className="text-emerald-500 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">{rawConsole || "No CLI output."}</pre></div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
