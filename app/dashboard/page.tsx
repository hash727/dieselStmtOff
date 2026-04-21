import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Fuel, Timer, ZapOff, Droplets, History, Globe } from "lucide-react"

const DashboardHome = async () => {
  const session = await auth()
  const officeId = session?.user?.activeOfficeId || session?.user?.officeId
  if (!officeId) return null

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const startOfMonth = new Date(year, month - 1, 1)

  // 1. Fetch Parallel Data
  const [engineLogs, dieselLogs, monthlyBalance, lifetimeStats, recentLogs] = await Promise.all([
    prisma.engineLog.findMany({ where: { officeId, date: { gte: startOfMonth } } }),
    prisma.dieselLog.findMany({ where: { officeId, date: { gte: startOfMonth } } }),
    prisma.monthlyBalance.findUnique({ where: { officeId_month_year: { officeId, month, year } } }),
    // Aggregate Lifetime Totals
    prisma.engineLog.aggregate({
      where: { officeId },
      _sum: { dieselConsumption: true, engineRunDuration: true, powerCutDuration: true },
      _count: { id: true }
    }),
    // Fetch Last 5 Records
    prisma.engineLog.findMany({
      where: { officeId },
      orderBy: { date: 'desc' },
      take: 5
    })
  ])

  // --- 2. Calculations ---
const openingBal = monthlyBalance?.openingBalance || 0;

// Current Month Totals
const totalConsumption = engineLogs.reduce((sum, log) => sum + (log.dieselConsumption || 0), 0);
const totalRunHours = engineLogs.reduce((sum, log) => sum + (log.engineRunDuration || 0), 0);
const totalPowerGap = engineLogs.reduce((sum, log) => sum + (log.powerCutDuration || 0), 0);
const totalRefilled = dieselLogs.reduce((sum, log) => sum + (log.quantity || 0), 0);

// Lifetime Totals (from the aggregate query)
const lifetimeConsumption = (lifetimeStats._sum.dieselConsumption || 0).toFixed(2);
const lifetimeRun = (lifetimeStats._sum.engineRunDuration || 0).toFixed(2);
const lifetimePowerGap = (lifetimeStats._sum.powerCutDuration || 0).toFixed(2);

// Current Stock
const currentStock = parseFloat((openingBal + totalRefilled - totalConsumption).toFixed(2));

  return (
    <div className="space-y-8">
      {/* --- LIFETIME TOTALS (Irrespective of Month/Year) --- */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Globe className="h-5 w-5 text-bsnl-blue" /> Lifetime Statistics</h2>
        <div className='grid gap-4 md:grid-cols-3'>
          <Card className="bg-slate-50 dark:bg-zinc-900/50">
            <CardHeader className="pb-2">
              <CardTitle className='text-xs font-medium uppercase'>Total HSD Consumed (All-Time)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{lifetimeConsumption} L</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-zinc-900/50">
            <CardHeader className="pb-2">
              <CardTitle className='text-xs font-medium uppercase'>Total Engine Run (All-Time)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{lifetimeRun} hrs</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-zinc-900/50">
            <CardHeader className="pb-2">
              <CardTitle className='text-xs font-medium uppercase'>Total Power Failure (All-Time)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>{lifetimePowerGap} hrs</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- CURRENT MONTH STATUS --- */}
      <div className='grid gap-4 md:grid-cols-4'>
         {/* 1. Current Stock Card (from previous step) */}
        <Card className={currentStock < 20 ? "border-red-500 bg-red-50/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className='text-sm font-medium'>Current Stock</CardTitle>
            <Droplets className={`h-4 w-4 ${currentStock < 20 ? "text-red-600 animate-pulse" : "text-emerald-600"}`} />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{currentStock.toFixed(2)} L</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Opening: {openingBal.toFixed(2)}L
            </p>
          </CardContent>
        </Card>

        {/* 2. Monthly Consumption Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className='text-sm font-medium'>Monthly Used</CardTitle>
            <Fuel className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalConsumption.toFixed(2)} L</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              In {now.toLocaleString('default', { month: 'short' })} {year}
            </p>
          </CardContent>
        </Card>

        {/* 3. Monthly Engine Run Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className='text-sm font-medium'>Engine Run</CardTitle>
            <Timer className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {Math.floor(totalRunHours)}h {Math.round((totalRunHours % 1) * 60)}m
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Active duration this month</p>
          </CardContent>
        </Card>

        {/* 4. Monthly Outages Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className='text-sm font-medium'>Power Failures</CardTitle>
            <ZapOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{engineLogs.length}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Events recorded in {now.toLocaleString('default', { month: 'short' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* --- RECENT ACTIVITY TABLE --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" /> Recent Activity (Last 5 Logs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Run Duration</TableHead>
                <TableHead>Consumption</TableHead>
                <TableHead className="text-right">Closing Meter</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{new Date(log.date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{log.engineRunDuration?.toFixed(2)} hrs</TableCell>
                  <TableCell>{log.dieselConsumption?.toFixed(2)} L</TableCell>
                  <TableCell className="text-right">{log.closeMeterReading?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardHome
