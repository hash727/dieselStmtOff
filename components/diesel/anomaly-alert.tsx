// components/diesel/anomaly-alert.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ShieldAlert, History } from "lucide-react";

interface LogEntry {
  id: string;
  date: Date;
  rowType: 'ENGINE' | 'DIESEL';
  openingDiesel?: number | null;     // Add | null
  dieselConsumption?: number | null; // Add | null
  quantity?: number | null;         // Add | null
  runningBalance: number;
  [key: string]: any;                // Allow extra fields like sortTime, powerOff, etc.
}


export default function AnomalyAlert({ logs }: { logs: LogEntry[] }) {
  // 1. Get the most recent log in the sorted array
  const latestLog = logs[logs.length - 1]; 
  
  if (!latestLog) return null;

  // 2. Logic: Expected Fuel = Previous Stock - Consumption + Refills
  // Since we already calculated 'runningBalance' in the page, we check for 'Variance'
  // between the reported 'Opening' and the actual current balance.
  
  const opening = latestLog.openingDiesel || 0;
  const consumption = latestLog.dieselConsumption || 0;
  const expectedStock = opening - consumption;
  const actualStock = latestLog.runningBalance;
  
  // Calculate Variance (Negative value means missing fuel)
  const variance = expectedStock - actualStock;

  // 3. Threshold check (BSNL Standard: Flag any discrepancy > 1.0L)
  if (latestLog.rowType === 'ENGINE' && variance > 1.0) {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        <ShieldAlert className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-800 font-bold flex items-center gap-2">
          Fuel Variance Alert!
        </AlertTitle>
        <AlertDescription className="text-red-700 mt-1">
          The system detected a missing quantity of **{variance.toFixed(2)} Liters** 
          for the log entry on **{new Date(latestLog.date).toLocaleDateString('en-GB')}**. 
          This indicates a potential fuel leak or unauthorized drainage. 
          Please cross-verify with the physical **Dip Rod** reading.
        </AlertDescription>
      </Alert>
    );
  }

  // Optional: Informational alert for recent refills
  if (latestLog.rowType === 'DIESEL') {
    return (
      <Alert className="bg-emerald-50 border-emerald-200">
        <History className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-800 font-medium">Stock Updated</AlertTitle>
        <AlertDescription className="text-emerald-700 text-xs">
          Last activity: Refill of **{latestLog.quantity}L** successfully added to the ledger.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
