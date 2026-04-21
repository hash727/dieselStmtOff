// app/olt/_components/olt-report-manager.tsx
"use client";

import { useState, useMemo } from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Box, Monitor, Signal, ZapOff } from "lucide-react";
import OltReportTable from "./olt-report-table";
import OltExportButton from "./olt-export-button";
import { Input } from "@/components/ui/input";

export default function OltReportManager({ olts }: { olts: any[] }) {
  const [search, setSearch] = useState("");

  // 1. Grouping Logic
  const groupedData = useMemo(() => {
    const filtered = olts.filter(olt => 
      olt.franchisee.toLowerCase().includes(search.toLowerCase()) ||
      olt.name.toLowerCase().includes(search.toLowerCase())
    );

    const groups: Record<string, any[]> = {};
    filtered.forEach((olt) => {
      if (!groups[olt.franchisee]) groups[olt.franchisee] = [];
      groups[olt.franchisee].push(olt);
    });
    return groups;
  }, [olts, search]);

  const groupKeys = Object.keys(groupedData).sort();

  return (
    <div className="space-y-6">
      {/* Search & Export Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="relative w-full max-w-sm">
          <Input 
            placeholder="Search Franchisee or OLT..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 h-10 pl-4"
          />
        </div>
        <OltExportButton data={olts} />
      </div>

      {/* Grouped Accordion */}
      <Accordion type="multiple" className="space-y-4">
        {groupKeys.map((franchisee) => {
          const items = groupedData[franchisee];
          const onlineCount = items.filter((o: any) => o.status).length;
          const offlineCount = items.length - onlineCount;

          return (
            <AccordionItem 
              key={franchisee} 
              value={franchisee} 
              className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden px-4"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-1 items-center justify-between pr-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-slate-100 dark:bg-zinc-900 rounded-lg">
                      <Box className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase text-slate-900 dark:text-zinc-100 leading-none">
                        {franchisee}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                        Total Assets: {items.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 text-[9px] font-black uppercase">
                      <Signal className="h-2.5 w-2.5 mr-1" /> {onlineCount} Online
                    </Badge>
                    {offlineCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 text-[9px] font-black uppercase">
                        <ZapOff className="h-2.5 w-2.5 mr-1" /> {offlineCount} Down
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="rounded-xl border border-slate-100 dark:border-zinc-900 overflow-hidden shadow-inner bg-slate-50/50 dark:bg-zinc-900/30">
                  <OltReportTable olts={items} />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {groupKeys.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
          <p className="text-sm font-bold text-slate-400 uppercase">No Franchisee data found matching search</p>
        </div>
      )}
    </div>
  );
}
