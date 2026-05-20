export const dynamic = 'force-dynamic';

import { auth } from '@/auth'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { prisma } from '@/lib/prisma'
import React from 'react'
import EngineForm from './engine-form'
import { redirect } from 'next/navigation'
import DeleteLogButton from '@/components/delete-log-button'
import ExportEngineData from '@/components/export-engine-data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EngineProfileForm from '@/components/add-engineProfile-form'
import { Prisma } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Fuel, Timer, ZapOff, Gauge, PlusCircle } from "lucide-react"
import AddDieselRefill from '@/components/add-diesel-refill'
import ExportPdfButton from '@/components/reports/export-pdf-button'
import ReportFilter from '@/components/reports/report-filter';
import CloseMonthButton from '@/components/close-month-button';

type EngineLogWithOffice = Prisma.EngineLogGetPayload<{
  include: { office: true }
}>

const EnginePage = async ({
  searchParams
}: {
  searchParams: Promise<{month?: string; year?: string}>
}) => {
    const params = await searchParams; 

    const session = await auth()
    const user = session?.user
    console.log("Session: ", session)

    if (session?.user?.role !== "USER" && !session?.user?.activeOfficeId) {
      redirect("/onboarding");
    }

    const activatedOfficeId = session?.user?.activeOfficeId || session?.user?.officeId;

    const userRole = user?.role;

    const canEdit = userRole === "ADMIN" || userRole === "MANAGER";

     // --- Date Selection Logic ---
     const now = new Date();
     // Default to current month/year if nothing is in the URL
     const selectedMonth = parseInt(params.month || (now.getMonth() + 1).toString());
     const selectedYear = parseInt(params.year || now.getFullYear().toString());
 
     // Define the start and end of the selected month for filtering
     const startDate = new Date(selectedYear, selectedMonth - 1, 1);
     const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

     // Format to YYYY-MM-DD for the HTML input
     const minDateStr = startDate.toISOString().split('T')[0];
     const maxDateStr = endDate.toISOString().split('T')[0];

     // Define previous month for fallback
    const prevMonthDate = new Date(selectedYear, selectedMonth - 2, 1);
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevYear = prevMonthDate.getFullYear();


    // Fetch logs and engine profile in paralle
    const [logs, dieselLogs, engineProfile, lastLog, officeInfo] = await Promise.all([
      prisma.engineLog.findMany({
        where: {
          officeId: session?.user?.activeOfficeId,
          date: { gte: startDate, lte: endDate }
        },
        orderBy: { 
          date: 'asc'
        },
        include: {
          office: true
        }
      }),
      prisma.dieselLog.findMany({
        where: {
          officeId: session.user.activeOfficeId,
          date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: 'asc'},
        // include: { office: true }
      }),
      prisma.engine.findUnique({
        where: {
          officeId: session?.user?.activeOfficeId
        }
      }),
      // Get most recent single record to find the last closing meter
      prisma.engineLog.findFirst({
        where: {
          officeId: session.user.activeOfficeId
        },
        orderBy: {
          date: 'desc'
        },
        select: {
          closeMeterReading: true,
          openingDiesel: true,
          dieselConsumption: true
        }
      }),
      prisma.office.findUnique({
        where: { id: activatedOfficeId },
        select: { name: true }
      })
    ]);

    const lastMeter = lastLog?.closeMeterReading || 0;

    const officeName = logs[0]?.office.name || "Selected Office";
    // const currentBalance = lastLog 
    //   ? (lastLog.openingDiesel || 0) - (lastLog.dieselConsumption || 0)
    //   : 0;

    const engineSlNo = engineProfile?.serialNumber || "N/A";
    //  Merge and sort chronologically for the ledger
    const unifiedStatement = [
      ...logs.map(log => ({ 
        ...log, 
        rowType: 'ENGINE' as const,
        engineSerial: engineSlNo,
        sortTime: new Date(log.powerOff || log.date).getTime()
      })),
      ...dieselLogs.map(log => ({ 
        ...log, 
        rowType: 'DIESEL' as const,
        engineSerial: engineSlNo,
        sortTime: new Date(log.date).getTime()
      }))
    ].sort((a, b) => a.sortTime - b.sortTime);

    // let currentBalance = 0;

    // const monthlyBalance = await prisma.monthlyBalance.findUnique({
    //   where: {
    //     officeId_month_year: {
    //       officeId: activatedOfficeId!,
    //       month: now.getMonth() + 1,
    //       year: now.getFullYear()
    //     }
    //   }
    // });

    // Fetch monthly balances for selected and previous months
    const [currentMonthlyData, prevMonthlyData] = await Promise.all([
      prisma.monthlyBalance.findUnique({
        where: { officeId_month_year: { officeId: activatedOfficeId!, month: selectedMonth, year: selectedYear } }
      }),
      prisma.monthlyBalance.findUnique({
        where: { officeId_month_year: { officeId: activatedOfficeId!, month: prevMonth, year: prevYear } }
      })
    ]);

    // Determine start point: Selected Month Opening -> Prev Month Closing -> 0
    const reportOpeningBalance = currentMonthlyData?.openingBalance ?? prevMonthlyData?.closingBalance ?? 0;
    let currentBalance = reportOpeningBalance;


    const transactions = unifiedStatement.map((entry) => {
      if(entry.rowType === 'DIESEL'){
        currentBalance += (entry.quantity || 0);

      }else{
        currentBalance -= parseFloat((entry.dieselConsumption || 0).toFixed(2));
      }
      // Round to 2 decimals to prevent floating point errors
      currentBalance = parseFloat(currentBalance.toFixed(2));
      return { ...entry, runningBalance: currentBalance}
    })

    const statementWithBalance = [
      {
        id: 'opening-bal',
        date: new Date(selectedYear, selectedMonth - 1, 1, 8, 0, 0), // 1st of current month
        rowType: 'OPENING' as const,
        runningBalance: reportOpeningBalance,
        engineSerial: engineSlNo,
      },
      ...transactions
    ];

    // --- Summary Calculations ---
    const totalConsumption = logs.reduce((sum, log) => sum + (log.dieselConsumption || 0), 0);
    const totalRuntime = logs.reduce((sum, log) => sum + (log.engineRunDuration || 0), 0);
    const totalPowerGap = logs.reduce((sum, log) => sum + (log.powerCutDuration || 0), 0);

    const totalRefilled = dieselLogs.reduce((sum, log) => sum + (log.quantity || 0), 0)
    const currentStock = totalRefilled - totalConsumption;

    // Reverse for display (Newest at top) but we keep copy for balance calc
    const displayLogs = [...statementWithBalance].reverse();

    // console.log(" Statement: ", displayLogs);

    // update the "current stock" card to match the ledger exactly
    const totalStock =  statementWithBalance[statementWithBalance.length - 1].runningBalance;

    // lastMeter = logs.length > 0 ? logs[logs.length - 1].closeMeterReading : null;
    // let runningBalance = 0;

  return (

    <Tabs defaultValue='logs' className='w-full'>
      <TabsList className="bg-slate-100 dark:bg-zinc-900">
        <TabsTrigger value="logs">Statement & Logs</TabsTrigger>
        <TabsTrigger value="profile">Engine Profile</TabsTrigger>
      </TabsList>

      <TabsContent value='logs' className='space-y-6 pt-4'>

          {/* Add this section to switch months */}
          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm">
            <h2 className="font-semibold text-lg">Viewing Data for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <ReportFilter currentMonth={selectedMonth} currentYear={selectedYear} />
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Diesel Stock</CardTitle>
                <Fuel className={`h-4 w-4 ${totalStock < 20 ? "text-red-500 animate-pulse" : "text-emerald-600"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStock.toFixed(2)} L</div>
                {/* <p className="text-xs text-muted-foreground">Total In: {totalRefilled}L</p> */}
                <p className="text-xs text-muted-foreground">
                  Opening: {reportOpeningBalance.toFixed(2) || 0}L | Refilled: {totalRefilled}L
                </p>
              </CardContent>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Diesel Used</CardTitle>
                <Fuel className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalConsumption.toFixed(2)} L</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engine Run</CardTitle>
                <Timer className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRuntime.toFixed(2)} hrs</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Power Cut</CardTitle>
                <ZapOff className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPowerGap.toFixed(2)} hrs</div>
              </CardContent>
            </Card>
          </div>

          {/*  Input Form */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-slate-100 dark:bg-zinc-900 p-4 shadow-sm">
              <EngineForm 
                officeId={session?.user.officeId || "" } 
                consumptionRate={engineProfile?.consumptionRate || 0}
                lastMeter={lastMeter}
                initialBalance={totalStock}
                defaultDate={startDate}
                minDate={minDateStr} // Pass this
                maxDate={maxDateStr} // Pass this
              />
            </div>

            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Engine Management</h1>
              <p className='text-sm text-muted-foreground'>{officeInfo?.name || "Office Logs"}</p>
              <ExportPdfButton 
                    data={statementWithBalance} 
                    officeName={officeInfo?.name || "Office"}
                    summary={{ currentStock, totalRuntime, totalConsumption }}
                />
            </div>
            <div className="rounded-md border bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-zinc-900/95">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Power Off</TableHead>
                    <TableHead>Engine On</TableHead>
                    <TableHead>Power On</TableHead>
                    <TableHead>Engine Off</TableHead>
                    {/* <TableHead>Office</TableHead> */}
                    <TableHead>Power Cut</TableHead>
                    <TableHead>Engine Run</TableHead>
                    <TableHead>Meter (Readings)</TableHead>
                    <TableHead>Diesel consumption (L)</TableHead>
                    <TableHead>Diesel Balance (L)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className='text-center py-10 text-muted-foreground'>
                        No logs found. Start by adding one above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayLogs.map((log: any) => {

                      // Handle the Opening Balance Row in the UI
                      if (log.rowType === 'OPENING') {
                        return (
                          <TableRow key="opening-row" className="bg-slate-50/50 italic text-muted-foreground text-xs">
                            <TableCell>{new Date(log.date).toLocaleDateString('en-GB')}</TableCell>
                            <TableCell colSpan={4}>OPENING BALANCE CARRIED FORWARD</TableCell>
                            <TableCell className="text-right font-bold">{log.runningBalance.toFixed(2)}</TableCell>
                            <TableCell />
                          </TableRow>
                        );
                      }
                      // if(log.rowType === "DIESEL"){
                      //   console.log("REFILL ROW DATA:", log);
                        
                      // }else{
                      //   console.log("ENGINE ROW DATA:", log)
                      // }
                      const isDiesel = log.rowType === 'DIESEL';
                      // const dIn = isDiesel ? (Number(log.quantity) || 0) : 0;
                      // const dOut = !isDiesel ? (Number(log.dieselConsumption) || 0) : 0;
                      // runningBalance = Number(runningBalance + dIn - dOut);
                      
                      
                    return (
                      <TableRow key={log.id} className={isDiesel ? 'bg-slate-50/50 dark:bg-zinc-800/95 font-medium text-emerald-900 dark:text-emerald-300' : "bg-slate-50/50 dark:bg-zinc-800/95"}>
                        <TableCell className='whitespace-nowrap'>{new Date(log.date).toLocaleDateString()}</TableCell>
                        {isDiesel ? (
                          <>
                            {/*  Special wide cell for Refill rows */}
                            <TableCell colSpan={7} className='text-emerald-900 dark:text-emerald-300 font-bold italic'>
                              <div className='flex items-center gap-2'>
                                <PlusCircle className='h-4 w-4'/> ADDED HSD to the E/A {officeInfo?.name?.toUpperCase()} (DG Sl.No: {log?.engineSerial}) office, with (+{log.quantity} Liters)
                              </div>
                            </TableCell>
                            <TableCell className='font-bold text-emerald-700 dark:text-emerald-400'>+{log.quantity}L</TableCell>
                          </>
                        ) : (

                          <>
                            {/* <TableCell>{log.date.toLocaleDateString()}</TableCell> */}
                            <TableCell >{log.powerOff?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '-'}</TableCell>
                            <TableCell >{log.engineOn?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '-'}</TableCell>
                            <TableCell >{log.powerOn?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '-'}</TableCell>
                            <TableCell >{log.engineOff?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '-'}</TableCell>
                            {/* <TableCell className="text-slate-500">{log.office.name}</TableCell> */}
                            <TableCell >{log.powerCutDuration?.toFixed(2) || '0.00'} hrs</TableCell>
                            <TableCell >{log.engineRunDuration?.toFixed(2) || '0.00'} hrs</TableCell>
                            <TableCell >
                              <div className="flex items-center gap-1 text-xs">
                                <Gauge className="h-3 w-3" /> {log.openMeterReading?.toFixed(2)} → {log.closeMeterReading?.toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell className="text-red-600 dark:text-red-400">-{log.dieselConsumption} L</TableCell>
                          </>
                        )}

                        {/* <TableCell className={isDiesel ? "text-emerald-600 font-bold" : "text-blue-600 font-bold"}>
                          {isDiesel ? (
                            `+${dIn.toFixed(1)} L`
                           ) : (
                              log.dieselConsumption ? `-${log.dieselConsumption.toFixed(2)} L` : "0.00 L"
                          )}
                        </TableCell> */}

                        {/* <TableCell className="font-bold text-blue-600">{log.dieselConsumption?.toFixed(2)}</TableCell> */}

                        <TableCell className="font-bold bg-slate-50/30 dark:bg-zinc-800/30">
                          {isNaN(log.runningBalance) ? "0.00" : log.runningBalance.toFixed(2)} L
                        </TableCell>

                        <TableCell className='text-right'>
                          <DeleteLogButton id={log.id} type={log.rowType} />
                        </TableCell>
                      </TableRow>
                    )
                  }).reverse()   //Newest at top
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Office Ledger</h1>
            <div className="flex gap-2">
              <AddDieselRefill officeId={session.user.officeId} /> {/* NEW COMPONENT */}
              <ExportEngineData 
                data={statementWithBalance} 
                officeName={officeInfo?.name || "Office"}
                engineSerial={engineProfile?.serialNumber || "N/A"}
              />
              <ExportPdfButton 
                data={statementWithBalance} 
                officeName={officeInfo?.name || "Office"}
                summary={{ currentStock, totalRuntime, totalConsumption }}
              />
              {/* Replace the broken Button with this: */}
              <CloseMonthButton 
                officeId={activatedOfficeId}
                month={selectedMonth}
                year={selectedYear}
                totalStock={totalStock}
              />
            </div>
          </div>
      </TabsContent>
                
      <TabsContent value="profile">
        <EngineProfileForm 
          officeId={session?.user.officeId}
          initialData={engineProfile}
          isReadOnly={!canEdit}
        />
      </TabsContent>

    </Tabs>

  )
}

export default EnginePage