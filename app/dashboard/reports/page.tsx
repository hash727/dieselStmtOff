import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatementPDF } from "@/components/reports/statement-pdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportFilter from "@/components/reports/report-filter";
import DownloadReportButton from "@/components/reports/download-button";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import ExportPdfButton from "@/components/reports/export-pdf-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ReportsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ month?: string; year?: string } >
}) {
  const params = await searchParams;
  const session = await auth();

  // 1. Session & Office Logic (Matched with EnginePage)
  if (session?.user?.role !== "USER" && !session?.user?.activeOfficeId) {
    redirect("/onboarding");
  }
  const activatedOfficeId = session?.user?.activeOfficeId || session?.user?.officeId;

  // 2. Date & Month Logic
  const now = new Date();
  const month = parseInt(params.month || (now.getMonth() + 1).toString());
  const year = parseInt(params.year || now.getFullYear().toString());

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Previous month for fallback
  const prevMonthDate = new Date(year, month - 1, 1);
  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevYear = prevMonthDate.getFullYear();

  // 3. Unified Parallel Fetch
  const [logs, dieselLogs, engineProfile, currentMonthlyData, prevMonthlyData, officeInfo] = await Promise.all([
    prisma.engineLog.findMany({
      where: { officeId: activatedOfficeId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    }),
    prisma.dieselLog.findMany({
      where: { officeId: activatedOfficeId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    }),
    prisma.engine.findUnique({ where: { officeId: activatedOfficeId } }),
    prisma.monthlyBalance.findUnique({
      where: { officeId_month_year: { officeId: activatedOfficeId!, month, year } }
    }),
    prisma.monthlyBalance.findUnique({
      where: { officeId_month_year: { officeId: activatedOfficeId!, month: prevMonth, year: prevYear } }
    }),
    prisma.office.findUnique({ where: { id: activatedOfficeId }, select: { name: true } })
  ]);

  // 4. FIX: Robust Opening Balance Calculation
  const reportOpeningBalance = currentMonthlyData?.openingBalance 
    ?? prevMonthlyData?.closingBalance 
    ?? 0;

  let runningBalance = reportOpeningBalance;
  const engineSlNo = engineProfile?.serialNumber || "N/A";

  // 5. Merge & Map Ledger (One Pass)
  const unifiedData = [
    ...logs.map(l => ({ ...l, rowType: 'ENGINE' as const })),
    ...dieselLogs.map(d => ({ ...d, rowType: 'DIESEL' as const }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const transactions = unifiedData.map((entry) => {
    if (entry.rowType === 'DIESEL') {
      runningBalance += (entry.quantity || 0);
    } else {
      runningBalance -= parseFloat((entry.dieselConsumption || 0).toFixed(2));
    }
    // Round to 2 decimals to prevent JS floating point glitches
    runningBalance = parseFloat(runningBalance.toFixed(2));

    return { 
      ...entry, 
      runningBalance,
      engineSerial: engineSlNo 
    };
  });

  const statementWithBalance = [
    {
      id: 'opening-bal',
      date: startDate, // 1st of the month
      rowType: 'OPENING', // New type for your PDF logic
      runningBalance: reportOpeningBalance,
      engineSerial: engineSlNo,
    },
    ...transactions
  ];

  // 6. Final Metrics for Summary Cards/PDF
  const totalConsumption = logs.reduce((sum, log) => sum + (log.dieselConsumption || 0), 0);
  const totalRuntime = logs.reduce((sum, log) => sum + (log.engineRunDuration || 0), 0);
  const totalRefilled = dieselLogs.reduce((sum, log) => sum + (log.quantity || 0), 0);
  const currentStock = statementWithBalance.length > 0 
    ? statementWithBalance[statementWithBalance.length - 1].runningBalance 
    : reportOpeningBalance;

    

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-bsnl-blue">Monthly Reports</h1>
      
      <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
        <ReportFilter currentMonth={month} currentYear={year} />
        
        {/* {finalData.length > 0 && (
          <PDFDownloadLink 
            document={<StatementPDF data={finalData} officeName={officeInfo?.name} />}
            fileName={`BSNL_Report_${officeInfo?.name}_${month}_${year}.pdf`}
            className="bg-bsnl-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
          >
            {({ loading }) => (loading ? "Preparing PDF..." : "Download Report")}
          </PDFDownloadLink>
        )} */}
        {/* {finalData.length > 0 && (
            <DownloadReportButton 
              data={finalData} 
              officeName={officeInfo?.name} 
              month={month} 
              year={year} 
              openingBalance={reportOpeningBalance}
            />
        )} */}
        {statementWithBalance.length > 0 && (
          <ExportPdfButton 
              data={statementWithBalance} 
              officeName={officeInfo?.name || "Office"}
              summary={{ currentStock, totalRuntime, totalConsumption }}
          />
        )}
        
      </div>

      {statementWithBalance.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
          No logs found for the selected month.
        </div>
      ) : (
        <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
           {/* You can render a preview table here similar to EnginePage */}
           <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Details / Time (P-Off | E-On | P-On | E-Off)</TableHead>
                  <TableHead className="text-center">Run (h)</TableHead>
                  <TableHead className="text-center">Meter (O-C)</TableHead>
                  <TableHead className="text-center">Diesel (+/-)</TableHead>
                  <TableHead className="text-right font-bold">Balance (L)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statementWithBalance.map((log: any, i: number) => {
                  // 1. Handle Opening Balance Row
                  if (log.rowType === 'OPENING') {
                    return (
                      <TableRow key="opening" className="bg-blue-50/50 italic text-muted-foreground">
                        <TableCell>{new Date(log.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell colSpan={4} className="font-medium">
                          OPENING BALANCE CARRIED FORWARD
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-700">
                          {log.runningBalance.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  // 2. Handle Diesel Refill Row
                  if (log.rowType === 'DIESEL') {
                    return (
                      <TableRow key={log.id} className="bg-emerald-50/30">
                        <TableCell>{new Date(log.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell colSpan={3} className="text-emerald-700 text-sm italic">
                          ADDED HSD FOR {officeInfo?.name?.toUpperCase()} (DG: {log.engineSerial})
                        </TableCell>
                        <TableCell className="text-center font-bold text-emerald-600">
                          +{log.quantity?.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {log.runningBalance.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  // 3. Handle Standard Engine Run Row
                  return (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.date).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell className="text-[11px] font-mono">
                        {log.powerOff ? new Date(log.powerOff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'} | 
                        {log.engineOn ? new Date(log.engineOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'} | 
                        {log.powerOn ? new Date(log.powerOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'} | 
                        {log.engineOff ? new Date(log.engineOff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                      </TableCell>
                      <TableCell className="text-center">{log.engineRunDuration?.toFixed(2)}</TableCell>
                      <TableCell className="text-center text-[11px]">
                        {log.openMeterReading?.toFixed(2)} - {log.closeMeterReading?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center font-bold text-red-500">
                        -{log.dieselConsumption?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {log.runningBalance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
        </div>
      )}
    </div>
  );
}
