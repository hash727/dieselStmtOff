// app/_components/charts/traffic-chart.tsx
"use client";

import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Zap } from "lucide-react";

interface TrafficChartProps {
  title?: string;
  description?: string;
  data?: { time: string; ms: number }[];
  color?: "blue" | "emerald" | "amber";
}

export function TrafficChart({ 
  title = "Network Latency", 
  description = "Real-time ICMP response timing",
  data = [], 
  color = "blue" 
}: TrafficChartProps) {
  
  // Theme Mapping
  const themes = {
    blue: { stroke: "#2563eb", fill: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-100 dark:border-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    emerald: { stroke: "#10b981", fill: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    amber: { stroke: "#f59e0b", fill: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-100 dark:border-amber-900/30", text: "text-amber-700 dark:text-amber-400" }
  };

  const activeTheme = themes[color];

  return (
    <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div className="space-y-1">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
            <Activity className={`h-4 w-4 ${activeTheme.text}`} />
            {title}
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {description}
          </CardDescription>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${activeTheme.bg} ${activeTheme.border}`}>
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse`} style={{ backgroundColor: activeTheme.stroke }}></span>
          <span className={`text-[9px] font-black uppercase ${activeTheme.text}`}>Live Node</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px] w-full font-mono text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeTheme.fill} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={activeTheme.fill} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-zinc-800" />
              
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8' }}
                unit="ms"
              />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: activeTheme.fill }}
                cursor={{ stroke: activeTheme.stroke, strokeWidth: 2 }}
              />

              {/* Threshold Line at 100ms */}
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'ALERT', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />

              <Area 
                type="monotone" 
                dataKey="ms" 
                stroke={activeTheme.stroke} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#gradient-${color})`} 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
