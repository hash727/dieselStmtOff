// app/olt/manual-ping/page.tsx
import { getOlts } from "@/app/actions/olt";
import OltPingConsole from "../_components/olt-ping-console";

interface PageProps {
  searchParams: Promise<{ ip?: string }>;
}

export default async function OltManualPingPage({ searchParams }: PageProps) {

  const { ip } = await searchParams;

  const result = await getOlts();
  const olts = Array.isArray(result) ? result : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tight">
          Manual Diagnostics
        </h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Verify end-to-end connectivity for OLT nodes
        </p>
      </div>

      {/* The Interactive Client Component */}
      <OltPingConsole olts={olts} initialIp={ip || ""} />
    </div>
  );
}
