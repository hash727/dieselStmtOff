"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Droplet, Fuel, Trash2 } from "lucide-react";
import { deleteLog } from "@/app/actions/engine";
import { toast } from "sonner";

interface DieselLedgerTableProps {
  refills: any[];
}

export default function DieselLedgerTable({ refills }: DieselLedgerTableProps) {
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this refill record?")) return;
    
    try {
      const res = await deleteLog(id, "DIESEL");
      if (res.success) toast.success("Refill deleted");
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-zinc-900/50">
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Refill Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refills.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No refill records found for this month.
              </TableCell>
            </TableRow>
          ) : (
            refills.map((refill) => (
              <TableRow key={refill.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{new Date(refill.date).toLocaleDateString('en-GB')}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(refill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Droplet className="h-3 w-3 text-blue-500" />
                    <span className="font-bold">{refill.quantity.toFixed(2)} L</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <Fuel className="mr-1 h-3 w-3" /> HSD Refill
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button 
                    onClick={() => handleDelete(refill.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
