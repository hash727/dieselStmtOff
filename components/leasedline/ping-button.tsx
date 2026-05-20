"use client";

import { useState } from "react";
import { checkPingStatus } from "@/app/actions/ping";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function PingButton({ ip, lineId }: { ip: string, lineId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "online" | "offline">("idle");

  const handlePing = async () => {
    setStatus("loading");
    const result = await checkPingStatus(ip, lineId);
    setStatus(result.success ? "online" : "offline");
  };

  if (status === "loading") return (
    <Button variant="ghost" size="sm" onClick={handlePing} className="h-8 w-8 p-0">
      <Loader2 className="h-5 w-5 animate-spin text-blue-500 cursor-pointer" />
    </Button>
  );
  if (status === "online") return (
    <Button variant="ghost" size="sm" onClick={handlePing} className="h-8 w-8 p-0">
      <CheckCircle2 className="h-5 w-5 text-emerald-500 cursor-pointer" />
    </Button>
  );
  if (status === "offline") return (
    <Button variant="ghost" size="sm" onClick={handlePing} className="h-8 w-8 p-0">
      <XCircle className="h-5 w-5 text-red-500 cursor-pointer" />
    </Button>
  );

  return (
    <Button variant="ghost" size="sm" onClick={handlePing} className="h-8 w-8 p-0">
      <Activity className="h-4 w-4 text-slate-400" />
    </Button>
  );
}
