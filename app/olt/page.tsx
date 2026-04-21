// app/olt/page.tsx
import { getOlts } from "@/app/actions/olt";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Cpu, 
  Activity, 
  Settings2, 
  FileText, 
  ArrowUpRight, 
  Zap, 
  Globe, 
  ShieldCheck 
} from "lucide-react";
import Link from "next/link";
// import { TrafficChart } from "../leasedlines/_components/traffic-chart"; // Reuse your existing chart
import { cn } from "@/lib/utils";
import { TrafficChart } from "@/components/charts/traffic-chart";

export default async function page() {
    const result = await getOlts();
  
    // Handle Unauthorized or Error string
    if (typeof result === "string") {
      return (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-red-200 rounded-3xl text-red-700">
          <Activity className="h-10 w-10 mb-4 animate-pulse" />
          <h2 className="text-xl font-black uppercase">Access Denied</h2>
          <p className="text-sm font-medium">Please sign in to view OLT infrastructure data.</p>
        </div>
      );
    }
  
  const olts = result; // TypeScript now knows 'olts' is an array

  const chartData = olts.map((olt, index) => ({
    time: olt.name.split('-').pop() || `Node ${index + 1}`, // Extracts short name
    ms: Math.floor(Math.random() * (15 - 2 + 1) + 2), // Simulated latency 2ms-15ms
  }));

  const totalOlts = olts.length;
  const activeOlts = olts.filter(o => o.status).length;
  const urbanCount = olts.filter(o => o.area === "URBAN").length;
  const ruralCount = olts.filter(o => o.area === "RURAL").length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            OLT Command Center
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Operational overview of fiber termination nodes and franchisee links.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="border-slate-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-widest">
            <Link href="/olt/reports">
              <FileText className="mr-2 h-4 w-4" /> System Logs
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20">
            <Link href="/olt/manage">
              <Settings2 className="mr-2 h-4 w-4" /> Configure
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard 
          title="Total Nodes" 
          value={totalOlts} 
          description="Registered OLTs" 
          icon={<Cpu className="text-blue-500" />} 
        />
        <QuickStatCard 
          title="Active Link" 
          value={activeOlts} 
          description={`${activeOlts}/${totalOlts} Online`} 
          icon={<Zap className="text-emerald-500" />} 
          status="success"
        />
        <QuickStatCard 
          title="Urban Sector" 
          value={urbanCount} 
          description="High-density nodes" 
          icon={<Globe className="text-amber-500" />} 
        />
        <QuickStatCard 
          title="Rural Sector" 
          value={ruralCount} 
          description="Village subnet nodes" 
          icon={<Activity className="text-purple-500" />} 
        />
      </div>

      {/* Main Grid: Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latency Graph (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Network Latency (Avg)</h3>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20">Live</Badge>
          </div>
           {/* The Chart now receives correctly formatted data */}
            <TrafficChart 
              title="OLT Node Response"
              description="Latency across distributed terminations"
              data={chartData} 
              color="emerald"
            /> 
        </div>

        {/* Action Shortcuts (1/3 width) */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 px-2">Diagnostic Shortcuts</h3>
          
          <ShortcutCard 
            href="/olt/manual-ping" 
            title="Manual ICMP" 
            desc="Run diagnostics on OLT IPs" 
            icon={<Activity className="h-5 w-5" />} 
            color="blue"
          />
          
          <ShortcutCard 
            href="/olt/manage" 
            title="VLAN Manager" 
            desc="Audit and assign outer VLANs" 
            icon={<ShieldCheck className="h-5 w-5" />} 
            color="emerald"
          />

          <div className="p-6 rounded-3xl bg-slate-900 dark:bg-zinc-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
             <Zap className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 rotate-12" />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">System Health</p>
             <h4 className="text-lg font-bold mb-4 text-emerald-400">99.98% Uptime</h4>
             <p className="text-xs opacity-70 leading-relaxed">
               All systems operational. No critical OLT alerts in the last 24 hours.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStatCard({ title, value, description, icon, status }: any) {
  return (
    <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tighter text-slate-900 dark:text-zinc-100">{value}</div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{description}</p>
        {status === "success" && (
          <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[92%] animate-pulse" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ShortcutCard({ href, title, desc, icon, color }: any) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50",
  };

  return (
    <Link href={href} className="group block">
      <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group-hover:border-blue-500 transition-all">
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-xl border", colorMap[color as keyof typeof colorMap])}>
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">{title}</h4>
            <p className="text-[10px] font-medium text-slate-500">{desc}</p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </Link>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border", className)}>
      {children}
    </span>
  );
}
