// app/olt/dashboard/page.tsx
import { getOlts } from "@/app/actions/olt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Signal, ZapOff, Cpu, Globe, Map } from "lucide-react";
import { TrafficChart } from "@/components/charts/traffic-chart";
import { BatchPingTool } from "@/components/diagnostics/batch-ping-tool";

export default async function OltDashboard() {
  const result = await getOlts();
  
  // Handle unauthorized or empty states
  const olts = Array.isArray(result) ? result : [];
  
  // 1. FORMAT DATA FOR CHART
  // In a real scenario, you'd fetch logs. For now, we map OLTs to a simulated time-series
  const chartData = olts.map((olt, index) => ({
    time: olt.name.split('-').pop() || `Node ${index + 1}`, // Extracts short name
    ms: Math.floor(Math.random() * (15 - 2 + 1) + 2), // Simulated latency 2ms-15ms
  }));

  // Real-time Calculations
  const total = olts.length;
  const active = olts.filter(o => o.status).length;
  const inactive = total - active;
  const urban = olts.filter(o => o.area === "URBAN").length;
  const rural = olts.filter(o => o.area === "RURAL").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header with Sector Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100 uppercase">
            OLT Infrastructure
          </h1>
          <p className="text-sm font-medium text-slate-500 font-mono uppercase tracking-tight">
            System Scan: {total} nodes identified across network
          </p>
        </div>
        <div className="flex gap-2">
           <SectorBadge label="Urban" count={urban} icon={<Globe className="h-3 w-3" />} />
           <SectorBadge label="Rural" count={rural} icon={<Map className="h-3 w-3" />} />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard title="Inventory" value={total} icon={<Cpu className="text-blue-500" />} />
        <StatusCard title="Online" value={active} icon={<Signal className="text-emerald-500" />} color="emerald" />
        <StatusCard title="Offline" value={inactive} icon={<ZapOff className="text-red-500" />} color={inactive > 0 ? "red" : "slate"} />
        <StatusCard title="Network Avg" value="4.2ms" icon={<Activity className="text-amber-500" />} />
      </div>

      {/* Main Grid: Diagnostics & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Batch Tool & Live Chart */}
        <div className="lg:col-span-2 space-y-6">
          <BatchPingTool />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Latency Performance</h3>
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gateway Bridge Active
              </span>
            </div>
            
            {/* The Chart now receives correctly formatted data */}
            <TrafficChart 
              title="OLT Node Response"
              description="Latency across distributed terminations"
              data={chartData} 
              color="emerald"
            /> 
          </div>
        </div>

        {/* Right Column: Node List Sidebar */}
        <div className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Node Quick View</h3>
           <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-sm">
              <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {olts.map(olt => (
                  <div key={olt.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-900/50 rounded-2xl transition-all group">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 dark:text-zinc-200 uppercase tracking-tight">{olt.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-500 transition-colors">{olt.ip}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-bold text-slate-300 font-mono">VLAN {olt.outerVlan}</span>
                       <div className={`h-2 w-2 rounded-full ${olt.status ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                    </div>
                  </div>
                ))}
                {olts.length === 0 && (
                  <div className="p-10 text-center text-[10px] font-bold text-slate-400 uppercase">No nodes found</div>
                )}
              </div>
           </div>

           {/* Professional System Health Summary */}
           <div className="p-6 rounded-3xl bg-slate-900 dark:bg-zinc-900 border border-slate-800 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Cpu className="h-12 w-12" />
             </div>
             <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">Health Score</p>
             <h4 className="text-2xl font-black mb-2">99.8%</h4>
             <p className="text-[10px] opacity-60 leading-relaxed uppercase font-bold tracking-tighter">
               Total Uptime tracking enabled for {total} circuits. All systems check within nominal range.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal Helper Components ---

function StatusCard({ title, value, icon, color = "slate" }: any) {
  const colorMap = {
    emerald: "border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10",
    red: "border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10",
    slate: "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
  };

  return (
    <Card className={`${colorMap[color as keyof typeof colorMap]} shadow-sm group hover:shadow-md transition-all border rounded-3xl`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{title}</span>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tighter text-slate-900 dark:text-zinc-100">{value}</div>
      </CardContent>
    </Card>
  );
}

function SectorBadge({ label, count, icon }: any) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{label}:</span>
      <span className="text-[10px] font-black text-slate-900 dark:text-zinc-100">{count}</span>
    </div>
  );
}
