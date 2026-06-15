// components/diesel/diesel-ledger-table.tsx
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, CreditCard } from "lucide-react";

interface DieselPurchaseItem {
  id: string;
  invoiceNumber: string;
  purchaseDate: string | Date;
  amount: number;
  quantity: number;
  fleetCardNumber: string;
  sapDocumentNo?: string | null;
  remarks?: string | null;
  user?: {
    name?: string;
  };
}

export default function DieselLedgerTable({ refills }: { refills: DieselPurchaseItem[] }) {
  return (
    <div className="rounded-md border overflow-x-auto bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[120px]">Purchase Date</TableHead>
            <TableHead>Invoice No.</TableHead>
            <TableHead>Fleet Card ID</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Amount (Rs.)</TableHead>
            <TableHead>SAP Doc No.</TableHead>
            <TableHead>Recorded By</TableHead>
            <TableHead className="text-right w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refills.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                No diesel purchase records found.
              </TableCell>
            </TableRow>
          ) : (
            refills.map((purchase) => (
              <TableRow key={purchase.id} className="hover:bg-muted/30">
                {/* 1. Purchase Date */}
                <TableCell className="font-medium whitespace-nowrap">
                  {new Date(purchase.purchaseDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                
                {/* 2. Invoice Number */}
                <TableCell className="font-mono font-bold text-slate-700">
                  {purchase.invoiceNumber}
                </TableCell>
                
                {/* 3. Fleet Card Number */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="h-3 w-3 text-sky-600 shrink-0" />
                    <span className="font-mono">{purchase.fleetCardNumber}</span>
                  </div>
                </TableCell>
                
                {/* 4. Quantity filled */}
                <TableCell className="text-center font-bold text-emerald-600 whitespace-nowrap">
                  +{purchase.quantity.toFixed(1)} L
                </TableCell>
                
                {/* 5. Total Amount Paid */}
                <TableCell className="text-right font-mono font-semibold text-slate-900">
                  ₹{purchase.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                
                {/* 6. Optional SAP Document Reference */}
                <TableCell>
                  {purchase.sapDocumentNo ? (
                    <Badge variant="secondary" className="font-mono text-[10px] tracking-wide px-1.5 py-0">
                      {purchase.sapDocumentNo}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/50 text-xs">—</span>
                  )}
                </TableCell>
                
                {/* 7. Recorded By (Dynamic User Relation) */}
                <TableCell className="max-w-[150px] truncate text-muted-foreground">
                  {purchase.user?.name || "System Admin"}
                </TableCell>
                
                {/* 8. Actions Cell */}
                <TableCell className="text-right">
                  <button 
                    onClick={() => console.log("View Details For:", purchase.id)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium hover:underline transition-all cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View</span>
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
