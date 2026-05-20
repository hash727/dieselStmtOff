import { prisma } from "@/lib/prisma";
import ImportExcelButton from "../upload/page";
import ClearDataButton from "@/components/leasedline/clear-data-button";
import DownloadTemplate from "@/components/leasedline/download-template";
import PingButton from "@/components/leasedline/ping-button";
import PingStatusModal from "@/components/leasedline/ping-status-modal";

export default async function LeasedLinesPage() {
  const leasedLines = await prisma.leasedLine.findMany({
    orderBy: { sNo: 'asc' }
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bsnl-blue dark:text-blue-400">
            Leased Line Inventory
          </h1>
          <p className="text-sm text-muted-foreground">Manage and track active leased line connections</p>
        </div>
        <div className="flex items-center gap-3">
          <DownloadTemplate />
          <ImportExcelButton />
          <ClearDataButton />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
        <table className="w-full text-xs lg:text-sm text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-zinc-900/50 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b dark:border-zinc-800">
            <tr>
              <th className="p-3 border-r dark:border-zinc-800">S.no</th>
              <th className="p-3 border-r dark:border-zinc-800">SDCA</th>
              <th className="p-3 border-r dark:border-zinc-800">Customer Name</th>
              <th className="p-3 border-r dark:border-zinc-800">LC ID</th>
              <th className="p-3 border-r dark:border-zinc-800">Billing A/c</th>
              <th className="p-3 border-r dark:border-zinc-800">D.O.C</th>
              <th className="p-3 border-r dark:border-zinc-800">WAN / Subnet / GW</th>
              <th className="p-3 border-r dark:border-zinc-800">V-LAN</th>
              <th className="p-3 border-r dark:border-zinc-800">VRF</th>
              <th className="p-3 border-r dark:border-zinc-800">Service</th>
              <th className="p-3 border-r dark:border-zinc-800">Bandwidth</th>
              <th className="p-3 border-r dark:border-zinc-800">Media</th>
              <th className="p-3 border-r dark:border-zinc-800">Contact</th>
              <th className="p-3">BSNL/TIP</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {leasedLines.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-10 text-center text-muted-foreground italic">
                  No records found. Upload an Excel file to get started.
                </td>
              </tr>
            ) : (
              leasedLines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="p-3 border-r dark:border-zinc-800 text-muted-foreground">{line.sNo}</td>
                  <td className="p-3 border-r dark:border-zinc-800 font-medium">{line.sdca}</td>
                  <td className="p-3 border-r dark:border-zinc-800 font-bold text-slate-900 dark:text-slate-100">
                    {line.customerName}
                  </td>
                  <td className="p-3 border-r dark:border-zinc-800 font-mono text-[10px]">{line.lcId}</td>
                  <td className="p-3 border-r dark:border-zinc-800">{line.billingAcNo}</td>
                  <td className="p-3 border-r dark:border-zinc-800 whitespace-nowrap">
                    {new Date(line.doc).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-3 border-r dark:border-zinc-800 leading-tight">
                    <div className="font-medium text-blue-600 dark:text-blue-400">{line.wanIp}</div>
                    <div className="text-[10px] text-muted-foreground">{line.subnet}</div>
                    <div className="text-[10px] text-muted-foreground">{line.gateway}</div>
                  </td>
                  <td className="p-3 border-r dark:border-zinc-800">{line.vlan}</td>
                  <td className="p-3 border-r dark:border-zinc-800">{line.vrf}</td>
                  <td className="p-3 border-r dark:border-zinc-800">{line.serviceType}</td>
                  <td className="p-3 border-r dark:border-zinc-800 font-semibold">{line.bandwidth}</td>
                  <td className="p-3 border-r dark:border-zinc-800">{line.media}</td>
                  <td className="p-3 border-r dark:border-zinc-800">{line.contactNumber}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      line.bsnlTip === 'BSNL' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    }`}>
                      {line.bsnlTip}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <PingButton ip={line.wanIp} lineId={line.id} />
                  </td>
                  <td className="p-3 text-center">
                    <PingStatusModal ip={line.wanIp} name={line.customerName} lineId={line.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
