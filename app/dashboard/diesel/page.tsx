// app/dashboard/diesel/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, PlusCircle, History, TrendingDown } from "lucide-react";
import DieselRefillForm from "@/components/diesel/diesel-refill-form";
import DieselLedgerTable from "@/components/diesel/diesel-ledger-table";
import AnomalyAlert from "@/components/diesel/anomaly-alert";

export const dynamic = 'force-dynamic';

export default async function DieselManagementPage() {
  const session = await auth();
  const officeId = session?.user?.activeOfficeId || session?.user?.officeId;

  if (!officeId) return <div>Please select an office first.</div>;



  // 1. Fetch current month data
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const balanceMonth = now.getMonth(); // If today is April (4), this is March (3)
  const balanceYear = now.getFullYear();

  const [logs, refills, rawEngine, monthlyBalance] = await Promise.all([
    prisma.engineLog.findMany({ where: { officeId, date: { gte: startOfMonth } } }),
    prisma.dieselLog.findMany({ where: { officeId, date: { gte: startOfMonth } }, orderBy: { date: 'desc' } }),
    prisma.engine.findUnique({ 
        where: { 
            officeId: officeId
        },
        include: { 
            updatedBy: { 
                select: { 
                    name: true 
                } 
            } 
        }
    }),
    prisma.monthlyBalance.findUnique({
      where: {
        officeId_month_year: {
          officeId: officeId!,
          month: balanceMonth === 0 ? 12 : balanceMonth, // Handle January edge case
          year: balanceMonth === 0 ? balanceYear - 1 : balanceYear
        }
      }
    })
  ]);

  const engine = rawEngine || {
    make: "Not Configured",
    capacity: "N/A",
    serialNumber: "N/A",
    consumptionRate: 0,
    lastServiceHours: 0,
    lastServiceDate: new Date(),
  };

  // 2. Calculate Metrics
  const totalConsumed = logs.reduce((sum, log) => sum + (log.dieselConsumption || 0), 0);
  const totalRefilled = refills.reduce((sum, ref) => sum + (ref.quantity || 0), 0);
  
  // Note: For BSNL auditing, currentStock = (Previous Month Closing + Total Refilled) - Total Consumed
  const currentStock = (totalRefilled - totalConsumed); // Simplified for this example

  // 1. Merge and sort both log types chronologically
const unifiedStatement = [
    ...logs.map(log => ({ 
      ...log, 
      rowType: 'ENGINE' as const,
      sortTime: new Date(log.powerOff || log.date).getTime()
    })),
    ...refills.map(refill => ({ 
      ...refill, 
      rowType: 'DIESEL' as const,
      sortTime: new Date(refill.date).getTime()
    }))
  ].sort((a, b) => a.sortTime - b.sortTime);
  
  // 2. Calculate the Running Balance for the ledger
  let currentBalance = monthlyBalance?.openingBalance ||  0; // Ideally fetch previous month's closing balance
  const statementWithBalance = unifiedStatement.map((entry) => {
    if (entry.rowType === 'DIESEL') {
      // Cast as any to bypass the TS "property does not exist" check during the map
      currentBalance += parseFloat(((entry as any).quantity || 0).toFixed(2));
    } else {
      currentBalance -= parseFloat(((entry as any).dieselConsumption || 0).toFixed(2));
    }
    return { ...entry, runningBalance: currentBalance };
  });
   
  // 3. Final Stock for the Card
  const totalStock = statementWithBalance.length > 0 
    ? statementWithBalance[statementWithBalance.length - 1].runningBalance 
    : (monthlyBalance?.openingBalance || 0);

  return (
    <div className="p-6 space-y-6">
      <AnomalyAlert logs={statementWithBalance} />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Diesel Management</h1>
        <DieselRefillForm officeId={officeId} />
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={totalStock < 50 ? "border-red-200 bg-red-50/30" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Current Tank Stock</CardTitle>
          <Fuel className={`h-4 w-4 ${totalStock < 50 ? "text-red-500 animate-pulse" : "text-emerald-600"}`} />
        </CardHeader>
        <CardContent>
          {/* Use totalStock here instead of currentStock */}
          <div className="text-2xl font-bold">{totalStock.toFixed(2)} L</div>
          <div className="w-full bg-slate-200 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all" 
              style={{ width: `${Math.min(100, (totalStock / 200) * 100)}%` }} 
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Opening: {monthlyBalance?.openingBalance || 0}L
          </p>
        </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consumption (This Month)</CardTitle>
            <TrendingDown className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsumed.toFixed(2)} L</div>
            <p className="text-xs text-muted-foreground">Avg: {(totalConsumed / (now.getDate())).toFixed(2)} L/day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Refilled</CardTitle>
            <PlusCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalRefilled.toFixed(2)} L</div>
            <p className="text-xs text-muted-foreground">Across {refills.length} refill events</p>
          </CardContent>
        </Card>
      </div>

      {/* Refill History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" /> Recent Diesel Refills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DieselLedgerTable refills={refills} />
        </CardContent>
      </Card>
    </div>
  );
}
