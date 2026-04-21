// app/leasedline/page.tsx
import { ArrowUpRight, Activity, ShieldCheck, Zap } from "lucide-react";

export default function LeasedLineOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">Circuit Overview</h1>
        <p className="text-sm text-slate-500 font-medium">Real-time performance metrics for core leased lines.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusCard 
          title="Primary Fiber" 
          id="CKT-99021" 
          status="Operational" 
          latency="12ms" 
          load="42%" 
          color="emerald" 
        />
        <StatusCard 
          title="Secondary P2P" 
          id="CKT-88120" 
          status="High Latency" 
          latency="145ms" 
          load="12%" 
          color="amber" 
        />
        <StatusCard 
          title="Backup Radio" 
          id="CKT-44031" 
          status="Offline" 
          latency="N/A" 
          load="0%" 
          color="red" 
        />
      </div>
    </div>
  );
}

function StatusCard({ title, id, status, latency, load, color }: any) {
  const colors = {
    emerald: "bg-emerald-500 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400",
    amber: "bg-amber-500 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400",
    red: "bg-red-500 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400"
  };

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-2 rounded-xl ${color === 'red' ? 'bg-red-100' : 'bg-blue-100'} dark:bg-zinc-900`}>
          <Activity className={`h-5 w-5 ${color === 'red' ? 'text-red-500' : 'text-blue-600'}`} />
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colors[color as keyof typeof colors]}`}>
          {status}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-black text-slate-900 dark:text-zinc-100">{title}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{id}</p>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-900 flex justify-between">
        <div className="text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Latency</p>
          <p className="text-sm font-black text-slate-900 dark:text-zinc-100">{latency}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Load</p>
          <p className="text-sm font-black text-slate-900 dark:text-zinc-100">{load}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Health</p>
          <p className="text-sm font-black text-emerald-500">99.9%</p>
        </div>
      </div>
    </div>
  );
}
