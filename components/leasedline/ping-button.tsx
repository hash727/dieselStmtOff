"use client";

import { useState } from "react";
import { checkPingStatus } from "@/app/actions/ping";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function PingButton({ ip }: { ip: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "online" | "offline">("idle");

  const handlePing = async () => {
    setStatus("loading");
    const result = await checkPingStatus(ip);
    setStatus(result.success ? "online" : "offline");
  };

  if (status === "loading") return <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-500" />;
  if (status === "online") return <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-500" title="Online" />;
  if (status === "offline") return <XCircle className="h-5 w-5 mx-auto text-red-500" title="Offline" onClick={handlePing} className="cursor-pointer" />;

  return (
    <Button variant="ghost" size="sm" onClick={handlePing} className="h-8 w-8 p-0">
      <Activity className="h-4 w-4 text-slate-400" />
    </Button>
  );
}
