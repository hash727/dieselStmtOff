// app/olt/reports/page.tsx
import { getOltReportData } from "@/app/actions/olt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Printer, Filter, ShieldAlert, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OltReportTable from "../_components/olt-report-table";
import OltReportManager from "../_components/olt-report-manager";

export default async function OltReportsPage() {
  const data = await getOltReportData();

  if (!data.success || !data.olts) return <div>Error loading reports.</div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">Inventory Reports</h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest text-[10px]">Network Audit & Node Lifecycle</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-xs font-bold uppercase border-slate-200 dark:border-zinc-800">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase shadow-lg shadow-emerald-500/20">
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Mini Dashboard for Report context */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ReportStat label="Total Nodes" value={data.summary.total} color="blue" />
        <ReportStat label="Online" value={data.summary.online} color="emerald" />
        <ReportStat label="Offline" value={data.summary.offline} color="red" />
        <ReportStat label="Urban" value={data.summary.urban} color="amber" />
        <ReportStat label="Rural" value={data.summary.rural} color="purple" />
      </div>

      {/* Main Report Table */}
      {/* <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <CardHeader className="border-b border-slate-50 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Full Node Inventory Details
            </CardTitle>
            <div className="flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 uppercase">Live Data</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <OltReportTable olts={data.olts} />
        </CardContent>
      </Card> */}
      {/* The main grouped manager */}
      <div className="mt-8">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Franchisee Groups</h2>
        <OltReportManager olts={data.olts} />
      </div>
    </div>
  );
}

function ReportStat({ label, value, color }: any) {
  const colors: any = {
    blue: "text-blue-600", emerald: "text-emerald-600", red: "text-red-600", 
    amber: "text-amber-600", purple: "text-purple-600"
  };
  return (
    <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-900 bg-slate-50/30 dark:bg-zinc-900/10">
      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-black ${colors[color]}`}>{value}</p>
    </div>
  );
}
