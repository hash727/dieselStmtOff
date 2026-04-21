// utils/diesel-logic.ts

import { prisma } from "@/lib/prisma";

export async function getMonthlySummary(
  officeId: string,
  month: number,
  year: number,
) {
  // 1. Fetch the Month's Opening Balance
  const record = await prisma.monthlyBalance.findUnique({
    where: { officeId_month_year: { officeId, month, year } },
  });

  const opening = record?.openingBalance || 0;

  // 2. Define the month's date range
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // 3. Aggregate In/Out data for the specific month
  const [refills, consumption] = await Promise.all([
    prisma.dieselLog.aggregate({
      where: { officeId, date: { gte: startDate, lt: endDate } },
      _sum: { quantity: true },
    }),
    prisma.engineLog.aggregate({
      where: { officeId, date: { gte: startDate, lt: endDate } },
      _sum: { dieselConsumption: true },
    }),
  ]);

  const totalIn = refills._sum.quantity || 0;
  const totalOut = consumption._sum.dieselConsumption || 0;

  // 4. Calculate the Final Closing Balance
  const closing = opening + totalIn - totalOut;

  return {
    openingBalance: opening,
    totalRefilled: totalIn,
    totalConsumed: totalOut,
    closingBalance: closing,
  };
}
