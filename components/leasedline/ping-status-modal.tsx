"use client";

import { useState } from "react";
import { checkPingStatus, getPingHistory } from "@/app/actions/ping";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity, Loader2, CheckCircle2, XCircle, Globe } from "lucide-react";

export default function PingStatusModal({ 
    ip, 
    name,
    lineId
}: { 
    ip: string; 
    name: string;
    lineId: string;

}) {
  const [status, setStatus] = useState<"idle" | "pinging" | "success" | "error">("idle");
  const [latency, setLatency] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const data = await getPingHistory(lineId);
    setHistory(data);
  };

  const startPing = async () => {
    setStatus("pinging");
    setLatency(null);
    const result = await checkPingStatus(ip, lineId);
    if (result.success) {
        setStatus("success");
        setLatency(result.latency as string);
    } else {
        setStatus("error");
    }
    fetchHistory();
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchHistory()}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={startPing} className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950">
          <Activity className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-bsnl-blue" />
            Network Connectivity Check
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="text-center">
            <p className="text-lg font-bold">{name}</p>
            <p className="text-sm text-muted-foreground font-mono">{ip}</p>
          </div>

          {status === "pinging" && (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-sm animate-pulse">Sending ICMP packets...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-2">
                <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <p className="font-bold text-emerald-600 uppercase tracking-widest">Host is Online</p>
                
                {/* LATENCY DISPLAY */}
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-md">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Latency:</span>
                    <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {latency}
                    </span>
                </div>
                
                <p className="text-xs text-muted-foreground">Response received from {ip}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <p className="font-bold text-red-600 uppercase tracking-widest">Request Timed Out</p>
              <p className="text-xs text-muted-foreground">Host is unreachable or ICMP is blocked.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={startPing} disabled={status === "pinging"}>
            Re-Try Ping
          </Button>
        </div>

        <div className="mt-6 border-t pt-4">
          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Last 5 Attempts</p>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex justify-between text-[11px] bg-slate-50 dark:bg-zinc-900 p-2 rounded border dark:border-zinc-800">
                <span className={h.status === "Online" ? "text-emerald-600" : "text-red-600"}>
                  ● {h.status}
                </span>
                <span className="font-mono text-muted-foreground">
                  {h.latency || "---"}
                </span>
                <span className="text-slate-400">
                  {new Date(h.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
