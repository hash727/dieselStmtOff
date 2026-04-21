// app/leasedline/traffic-analysis/page.tsx
import { TrafficChart } from "@/components/charts/traffic-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simulated historical data for the chart and table
const trafficLogs = [
  { time: "09:00", ms: 14, jitter: "1.2ms", status: "Stable" },
  { time: "10:00", ms: 18, jitter: "2.4ms", status: "Stable" },
  { time: "11:00", ms: 45, jitter: "12.1ms", status: "Congested" },
  { time: "12:00", ms: 112, jitter: "25.4ms", status: "Critical" },
  { time: "13:00", ms: 22, jitter: "3.1ms", status: "Stable" },
  { time: "14:00", ms: 15, jitter: "1.1ms", status: "Stable" },
  { time: "15:00", ms: 19, jitter: "2.2ms", status: "Stable" },
];

export default function TrafficAnalysis() {
  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tight">
            Traffic Intelligence
          </h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest text-[10px]">
            Deep Packet Inspection & Latency Audit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 border-slate-200 dark:border-zinc-800 font-bold text-[10px] uppercase">
            <Download className="mr-2 h-3.5 w-3.5" /> Export Logs
          </Button>
          <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase">
            <Filter className="mr-2 h-3.5 w-3.5" /> Filter range
          </Button>
        </div>
      </div>
      
      {/* Primary Latency Graph */}
      <TrafficChart 
        title="WAN Link Latency"
        description="Core Gateway to ISP backbone (ICMP Response)"
        data={trafficLogs}
        color="blue"
      />

      {/* Historical Data Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
             <Search className="h-3 w-3" /> Historical Raw Logs
           </h3>
           <Badge variant="outline" className="text-[9px] font-black text-slate-400 border-slate-200 dark:border-zinc-800">
             Last 24 Hours
           </Badge>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
              <TableRow className="border-slate-100 dark:border-zinc-800">
                <TableHead className="text-[10px] font-black uppercase px-6">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Avg Response</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Jitter (Var)</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-right px-6">Link Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trafficLogs.map((log) => (
                <TableRow key={log.time} className="hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors border-slate-100 dark:border-zinc-800">
                  <TableCell className="px-6 font-mono text-xs font-bold text-slate-500">
                    Today, {log.time}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-black text-slate-900 dark:text-zinc-100">
                      {log.ms}ms
                      {log.ms > 50 ? (
                        <ArrowUpRight className="h-3 w-3 text-red-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-400 text-xs">
                    {log.jitter}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] font-black uppercase border-none px-2 py-0.5",
                        log.status === "Stable" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
                        log.status === "Congested" && "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
                        log.status === "Critical" && "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                      )}
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// Utility to merge classes safely
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
