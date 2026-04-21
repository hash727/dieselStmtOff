// app/olt/_components/olt-report-table.tsx
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function OltReportTable({ olts }: { olts: any[] }) {
  return (
    <Table>
      <TableHeader className="bg-slate-50 dark:bg-zinc-900/50">
        <TableRow className="border-none">
          <TableHead className="text-[10px] font-black uppercase">SL</TableHead>
          <TableHead className="text-[10px] font-black uppercase">OLT Name & IP</TableHead>
          <TableHead className="text-[10px] font-black uppercase">Franchisee</TableHead>
          <TableHead className="text-[10px] font-black uppercase">VLAN</TableHead>
          <TableHead className="text-[10px] font-black uppercase">Area</TableHead>
          <TableHead className="text-[10px] font-black uppercase">Installed On</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-right">Added To System</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {olts.map((olt, index) => (
          <TableRow key={olt.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 border-slate-100 dark:border-zinc-900">
            <TableCell className="text-[10px] font-bold text-slate-400">{index + 1}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-zinc-100">{olt.name}</span>
                <span className="text-[10px] font-mono text-blue-500">{olt.ip}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs font-medium text-slate-600 dark:text-zinc-400">{olt.franchisee}</TableCell>
            <TableCell>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-black text-slate-600 dark:text-zinc-300">
                {olt.outerVlan}
              </span>
            </TableCell>
            <TableCell>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                olt.area === "URBAN" 
                ? "border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-950/20" 
                : "border-purple-200 text-purple-600 bg-purple-50 dark:bg-purple-950/20"
              }`}>
                {olt.area}
              </span>
            </TableCell>
            <TableCell className="text-xs font-bold text-slate-500">
              {format(new Date(olt.installationDate), "dd-MMM-yyyy")}
            </TableCell>
            <TableCell className="text-right text-[10px] text-slate-400">
              {format(new Date(olt.createdAt), "PPP")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
