// lib/actions/service-actions.ts
"use server"

import { prisma } from "@/lib/prisma";

// export async function getEngineServiceStatus(officeId: string) {
//   // 1. Fetch Engine and Log Count separately
//   const [engine, logCount] = await Promise.all([
//     prisma.engine.findUnique({
//       where: { officeId },
//     }),
//     prisma.engineLog.count({
//       where: { officeId }
//     })
//   ]);

//   if (!engine) return null;

//   // 1. Calculate Total Running Hours from Logs
//   const aggregate = await prisma.engineLog.aggregate({
//     where: { officeId },
//     _sum: { engineRunDuration: true }
//   });
  
//   const totalHours = aggregate._sum.engineRunDuration || 0;
//   const hoursSinceService = totalHours - engine.lastServiceHours;

//   // 2. Calculate Months Since Last Service
//   const monthsSinceService = (new Date().getTime() - engine.lastServiceDate.getTime()) 
//     / (1000 * 60 * 60 * 24 * 30.44);

//   // BSNL/Standard Norms: 500 Hours or 6 Months
//   const isDueByHours = hoursSinceService >= 450; // Alert at 450h
//   const isDueByDate = monthsSinceService >= 5.5; // Alert at 5.5 months

//   return {
//     hoursSinceService: hoursSinceService.toFixed(1),
//     monthsSinceService: monthsSinceService.toFixed(1),
//     isUrgent: hoursSinceService >= 500 || monthsSinceService >= 6,
//     isWarning: isDueByHours || isDueByDate,
//     nextServiceDue: isDueByHours ? "By Hours" : "By Date"
//   };
// }

// lib/actions/service-actions.ts

export async function getEngineServiceStatus(officeId: string) {
  // 1. Fetch Engine data and Log count in parallel
  const [engine, logCount] = await Promise.all([
    prisma.engine.findUnique({
      where: { officeId },
    }),
    prisma.engineLog.count({
      where: { officeId }
    })
  ]);

  // If no engine is configured for this office, return null to hide the alerts
  if (!engine) return null;

  // 2. Aggregate Total Running Hours from all logs for this office
  const aggregate = await prisma.engineLog.aggregate({
    where: { officeId },
    _sum: { engineRunDuration: true }
  });
  
  const totalHours = aggregate._sum.engineRunDuration || 0;
  
  // Calculate hours since the JTO last recorded a B-Check
  const recordedServiceHours = engine.lastServiceHours ?? 0;

  const hoursSinceService = totalHours - recordedServiceHours;

  // 3. Calculate Time Elapsed (Months) since last service date
  const lastService = new Date(engine.lastServiceDate);
  const monthsSinceService = (new Date().getTime() - lastService.getTime()) 
    / (1000 * 60 * 60 * 24 * 30.44);

  // BSNL Standard Norms: B-Check due at 500 Hours or 6 Months
  const isDueByHours = hoursSinceService >= 450; // Warning threshold at 450h
  const isDueByDate = monthsSinceService >= 5.5; // Warning threshold at 5.5 months

  return {
    logCount,
    totalHours: totalHours.toFixed(1),
    hoursSinceService: hoursSinceService.toFixed(1),
    monthsSinceService: monthsSinceService.toFixed(1),
    // Flag as Urgent if limits are actually crossed
    isUrgent: hoursSinceService >= 500 || monthsSinceService >= 6,
    isWarning: isDueByHours || isDueByDate,
    nextServiceDue: isDueByHours ? "By Hours" : "By Date"
  };
}


export async function completeService(officeId: string, currentMeter: number) {
    await prisma.engine.update({
      where: { officeId },
      data: {
        lastServiceDate: new Date(),
        lastServiceHours: currentMeter
      }
    });
    // Revalidate paths to update the dashboard alerts
  }
  