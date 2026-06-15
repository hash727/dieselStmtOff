"use server";

import { prisma } from "@/lib/prisma"; // Adjust path to match your custom Prisma instance location

interface FetchExchangeListParams {
  month: number;
  year: number;
}

export async function getSubDivisionExchangeSummary({ month, year }: FetchExchangeListParams) {
  try {
    // Generate strict local ISO bounds for the target month (Safely handles different month upper bounds)
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 1. Fetch all office exchanges containing their respective telemetry relationships
    const offices = await prisma.office.findMany({
      include: {
        engine: true, 
        dieselLogs: {
          where: { date: { gte: startDate, lte: endDate } }
        },
        engineLogs: {
          where: { date: { gte: startDate, lte: endDate } }
        },
        monthlyBalances: {
          where: { month, year },
          take: 1
        },
        dieselPurchases: {
          where: { purchaseDate: { gte: startDate, lte: endDate } },
          orderBy: { purchaseDate: 'asc' } // Sorted chronologically for audit tracking
        }
      }
    });

    // 2. Loop through and aggregate statistics row-by-row
    const exchangeList = offices.map((office) => {
      const logs = office.dieselLogs || [];
      const eLogs = office.engineLogs || [];
      const purchases = office.dieselPurchases || [];
      const balanceProfile = office.monthlyBalances?.[0];

      // Structural Reductions
      const totalDieselRefilled = logs.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalConsumption = eLogs.reduce((sum, item) => sum + (item.dieselConsumption || 0), 0);
      const totalPowerCut = eLogs.reduce((sum, item) => sum + (item.powerCutDuration || 0), 0);
      const totalEngineRun = eLogs.reduce((sum, item) => sum + (item.engineRunDuration || 0), 0);
      
      // NEW REDUCTION: Aggregate the dynamic total financial cost logged for this specific exchange station
      const totalPurchaseAmount = purchases.reduce((sum, item) => sum + (item.amount || 0), 0);

      const openingBalance = balanceProfile?.openingBalance || 0;
      const stockBalance = balanceProfile?.closingBalance ?? (openingBalance + totalDieselRefilled - totalConsumption);

      return {
        id: office.id,
        officeName: office.name,
        engineCapacity: office.engine?.capacity || "15 KVA", 
        engineMake: office.engine?.make || "Kirloskar",
        engineInstalDate: office.engine?.installationDate 
          ? new Date(office.engine.installationDate).toLocaleDateString('en-GB') 
          : "-",
        openingBalance,
        totalDieselRefilled,
        totalConsumption,
        stockBalance,
        totalPowerCut,
        totalEngineRun,
        
        // ADDED TO RESOLVE 'NIL' ISSUES: Total purchase amount for Page 2
        totalPurchaseAmount, 

        // ADDED TO RESOLVE 'NIL' ISSUES: Forwarding the nested raw purchases array to Page 1
        purchases: purchases.map(p => ({
          id: p.id,
          invoiceNumber: p.invoiceNumber,
          purchaseDate: p.purchaseDate instanceof Date ? p.purchaseDate.toLocaleDateString('en-GB') : String(p.purchaseDate),
          amount: p.amount,
          quantity: p.quantity,
          fleetCardNumber: p.fleetCardNumber,
          sapDocumentNo: p.sapDocumentNo || "-",
          remarks: p.remarks || "Recorded",
          officeId: p.officeId
        }))
      };
    });

    return { success: true, data: exchangeList };
  } catch (error) {
    console.error("Sub-division query lookup exception:", error);
    return { success: false, error: "Failed to assemble multi-office ledger summary data map.", data: [] };
  }
}
