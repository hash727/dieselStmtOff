// components/diesel/diesel-ledger-table.tsx
"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DieselLedgerTable({ refills }: { refills: any[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Refill Date</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Bill/Invoice No.</TableHead>
          <TableHead>Recorded By</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {refills.map((refill) => (
          <TableRow key={refill.id}>
            <TableCell>{new Date(refill.date).toLocaleDateString('en-GB')}</TableCell>
            <TableCell className="font-bold text-emerald-600">+{refill.quantity} L</TableCell>
            <TableCell className="text-muted-foreground">INV-{refill.id.slice(0, 5).toUpperCase()}</TableCell>
            <TableCell>System Admin</TableCell>
            <TableCell className="text-right text-xs text-blue-600 cursor-pointer hover:underline">View Details</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
