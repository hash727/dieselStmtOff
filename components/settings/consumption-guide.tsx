import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info } from "lucide-react";

const BSNL_NORMS = [
  { kva: "7.5 KVA", rate: "1.2 - 1.5", load: "Single Phase" },
  { kva: "15 KVA", rate: "2.2 - 2.5", load: "Three Phase" },
  { kva: "30 KVA", rate: "4.5 - 5.0", load: "Full Exchange" },
  { kva: "62.5 KVA", rate: "9.0 - 11.0", load: "Major Hub" },
  { kva: "125 KVA", rate: "18.0 - 22.0", load: "Main Tax/Admin" },
];

export default function ConsumptionGuide() {
  return (
    <div className="rounded-lg border bg-slate-50/50 dark:bg-zinc-900/50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
        <Info className="h-4 w-4" />
        BSNL Standard Consumption Norms
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-8 text-[10px] uppercase">Capacity</TableHead>
            <TableHead className="h-8 text-[10px] uppercase">Avg L/Hr</TableHead>
            <TableHead className="h-8 text-[10px] uppercase text-right">Typical Use</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {BSNL_NORMS.map((item) => (
            <TableRow key={item.kva} className="hover:bg-transparent border-slate-200/50">
              <TableCell className="py-2 text-xs font-medium">{item.kva}</TableCell>
              <TableCell className="py-2 text-xs text-blue-600 font-bold">{item.rate}</TableCell>
              <TableCell className="py-2 text-xs text-right text-muted-foreground">{item.load}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-[10px] text-muted-foreground leading-tight italic">
        *Actual rates depend on engine health and connected load. Consult the site-specific MB (Measurement Book) for approved rates.
      </p>
    </div>
  );
}
