// app/olt/_components/olt-table.tsx
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Monitor, Cpu, Calendar, Box, 
  Copy, Activity, ExternalLink, MoreVertical, 
  Settings2,
  PenLine
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Olt } from "@prisma/client";
import { useState } from "react";
import { OltManageSheet } from "./olt-manage-sheet";
import { OltEditDialog } from "./olt-edit-dialog";
import { NetlinkManageSheet } from "./NetlinkManageSheet";
import { SyrotechManageSheet } from "./syrotech-manage-sheet";

export default function OltTable({ olts }: { olts: Olt[] }) {

  const [selectedOlt, setSelectedOlt] = useState<Olt | null>(null);
  const [editOlt, setEditOlt] = useState<Olt | null>(null);


  
  const copyToClipboard = (ip: string) => {
    navigator.clipboard.writeText(ip);
    toast.success(`IP ${ip} copied to clipboard`);
  };

  if (olts.length === 0) {
    return (
      <div className="p-20 text-center border-2 border-dashed rounded-2xl border-slate-200 dark:border-zinc-800">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No OLTs registered in database</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-zinc-900/50">
          <TableRow>
            <TableHead className="text-[10px] font-black uppercase py-4">Identification</TableHead>
            <TableHead className="text-[10px] font-black uppercase">Network Config</TableHead>
            <TableHead className="text-[10px] font-black uppercase">Hardware</TableHead>
            <TableHead className="text-[10px] font-black uppercase">Operational Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-right px-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {olts.map((olt) => (
            <TableRow key={olt.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-all">
              <TableCell className="py-4">
                <div className="flex flex-col gap-1">
                  <span className="font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-blue-500" />
                    {olt.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Box className="h-3 w-3" /> TIP: {olt.franchisee}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-900 px-2 py-1 rounded border border-slate-200 dark:border-zinc-800">
                    {olt.ip}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-slate-400 hover:text-blue-500"
                    onClick={() => copyToClipboard(olt.ip)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-2 ml-1">
                  VLAN: {olt.outerVlan}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] font-black uppercase">
                      {olt.type}
                    </Badge>
                    <span className="text-[10px] font-black text-slate-600 dark:text-zinc-400">{olt.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <Cpu className="h-3 w-3" /> {olt.make}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-2">
                  <div className={`flex items-center gap-2 w-fit px-2 py-0.5 rounded-full border ${
                    olt.status 
                    ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50 text-red-700 dark:text-red-400'
                  }`}>
                     <div className={`h-1.5 w-1.5 rounded-full ${olt.status ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                     <span className="text-[9px] font-black uppercase">{olt.status ? 'Online' : 'Offline'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <MapPin className="h-3 w-3 text-red-500" /> {olt.area}
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-right px-6">
                <div className="flex items-center justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-blue-600"
                  onClick={() => setEditOlt(olt)} // Trigger Edit
                >
                  <PenLine className="h-4 w-4" /> 
                </Button>
                  <Button 
                    asChild
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] font-black uppercase border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600"
                  >
                    <Link href={`/olt/manual-ping?ip=${olt.ip}`}>
                      <Activity className="h-3.5 w-3.5 mr-1.5" />
                      Ping
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-blue-500"
                    onClick={() => setSelectedOlt(olt)}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <OltEditDialog 
        olt={editOlt} 
        isOpen={!!editOlt} 
        onOpenChange={(open: boolean) => !open && setEditOlt(null)} 
      />
      {/* <OltManageSheet 
        olt={selectedOlt} 
        isOpen={!!selectedOlt} 
        onOpenChange={(open: boolean) => !open && setSelectedOlt(null)} 
      /> */}

       {/* --- VENDOR SPECIFIC CONDITIONAL RENDERING --- */}
       {selectedOlt?.make === "NETLINK" ? (
        <NetlinkManageSheet 
          olt={selectedOlt} 
          isOpen={!!selectedOlt} 
          onOpenChange={(open: boolean) => !open && setSelectedOlt(null)} 
        />
      ) : selectedOlt?.make === "SYROTECH" || selectedOlt?.make === "KHWAHISH" ? (
        // ✅ NEW SYROTECH HOOK CONDITIONAL TARGET BLOCK
          <SyrotechManageSheet
            olt={selectedOlt} 
            isOpen={!!selectedOlt} 
            onOpenChange={(open: boolean) => !open && setSelectedOlt(null)} 
          />
      ) : (
        <OltManageSheet 
          olt={selectedOlt} 
          isOpen={!!selectedOlt} 
          onOpenChange={(open: boolean) => !open && setSelectedOlt(null)} 
        />
      )}
    </div>
  );
}
