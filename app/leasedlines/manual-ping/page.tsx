"use client";

import { useState } from "react";
import { runManualPing } from "@/app/actions/ping";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Terminal, Wifi, AlertTriangle } from "lucide-react";

export default function ManualPingTool() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePing = async () => {
    setLoading(true);
    setResult(null);
    const res = await runManualPing(ip, 10);
    setResult(res);
    setLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto border-bsnl-blue/20">
      <CardHeader className="bg-slate-50 dark:bg-zinc-900/50">
        <CardTitle className="flex items-center gap-2 text-md">
          <Terminal className="h-5 w-5 text-bsnl-blue" />
          BSNL Diagnostic Ping Tool (10 Count)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex gap-2">
          <Input 
            placeholder="Enter WAN IP (e.g. 10.12.x.x)" 
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="font-mono"
          />
          <Button onClick={handlePing} disabled={loading || !ip} className="bg-bsnl-blue">
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
            Test Link
          </Button>
        </div>

        {result?.success && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 rounded-lg">
                <p className="text-[10px] uppercase font-bold text-emerald-600">Avg Latency</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{result.average}</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-zinc-800 border border-amber-200 rounded-lg">
                <p className="text-[10px] uppercase font-bold text-amber-600">Packet Loss</p>
                <p className="text-xl font-bold text-amber-700">{result.loss}</p>
              </div>
            </div>

            <div className="bg-black text-emerald-500 p-4 rounded-lg font-mono text-xs overflow-y-auto max-h-48">
              <p className="mb-2 text-slate-400 border-b border-slate-800 pb-1">Sequence Results:</p>
              {result.latencies.map((ms: string, i: number) => (
                <div key={i} className="flex justify-between py-0.5 border-b border-zinc-900">
                  <span>Reply from {ip}: bytes=32</span>
                  <span>time={ms}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result?.success === false && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">{result.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
