// app/olt/_components/olt-form.tsx
"use client";

import { useState, useTransition } from "react";
import { bulkUploadOlts, saveOlt } from "@/app/actions/olt";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Cpu, MapPin, Globe, Loader2, Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import * as XLSX from "xlsx"

export default function OltForm() {
  const [isPending, startTransition] = useTransition();
  const [isBulkPending, setIsBulkPending] = useState(false);

  // --- 1. DOWNLOAD TEMPLATE LOGIC ---
  const downloadTemplate = () => {
    const templateData = [
      {
        name: "OLT-SAMPLE-01",
        ip: "10.10.10.1",
        franchisee: "TIP_Name",
        type: "GPON", // Must be GPON, GEPON, or EPON
        make: "Syrotech",
        installationDate: "2024-01-01",
        outerVlan: 100,
        capacity: "16 Port",
        area: "URBAN", // Must be URBAN or RURAL
        location: "Main Hub Rack 1",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OLT_Template");
    XLSX.writeFile(workbook, "OLT_Upload_Template.xlsx");
    toast.success("Template downloaded!");
  };

  // --- 2. BULK UPLOAD LOGIC ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBulkPending(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet);

      const jsonData = JSON.parse(JSON.stringify(rawData))

      const result = await bulkUploadOlts(jsonData);
      if (result.success) {
        toast.success(`Successfully uploaded ${result.count} OLTs`);
      } else {
        toast.error(result.error);
      }
      setIsBulkPending(false);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      // Logic to convert FormData to a plain object for the action
      const data = Object.fromEntries(formData);
      // Ensure outerVlan is a number for the schema
      const result = await saveOlt({ ...data, outerVlan: Number(data.outerVlan) });

      if (result.success) {
        toast.success("OLT Registered Successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-10">
      {/* BULK UPLOAD SECTION */}
      <section className="p-6 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-xl text-white">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-emerald-700 dark:text-emerald-400">Bulk Registration</h3>
              <p className="text-xs font-bold text-slate-500">Upload multiple nodes via Excel</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="text-[10px] font-black uppercase border-emerald-200 dark:border-emerald-800">
              <Download className="h-3 w-3 mr-2" /> Download Template
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isBulkPending}
              />
              <Button size="sm" className="bg-emerald-600 text-white text-[10px] font-black uppercase">
                {isBulkPending ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : <UploadCloud className="h-3 w-3 mr-2" />}
                Upload Template
              </Button>
            </div>
          </div>
        </div>
      </section>

    <form action={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500">OLT Name</Label>
          <Input name="name" placeholder="e.g. OLT-CORE-01" required />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500">IP Address</Label>
          <Input name="ip" placeholder="10.x.x.x" required />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500">Franchisee (TIP)</Label>
          <Input name="franchisee" placeholder="Franchisee Name" required />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500">OLT Type</Label>
          <select name="type" className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-transparent p-2 text-sm">
            <option value="GPON">GPON</option>
            <option value="GEPON">GEPON</option>
            <option value="EPON">EPON</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500">Outer VLAN</Label>
          <Input type="number" name="outerVlan" placeholder="100" required />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500">Area Sector</Label>
          <select name="area" className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-transparent p-2 text-sm">
            <option value="URBAN">URBAN</option>
            <option value="RURAL">RURAL</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500">Make / Brand</Label>
          <Input name="make" placeholder="e.g. Syrotech / Huawei" required />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500">Capacity</Label>
          <Input name="capacity" placeholder="e.g. 16 Port" required />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500">Installation Date</Label>
          <Input type="date" name="installationDate" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase text-slate-500">Location Details</Label>
        <Input name="location" placeholder="Physical Address / Rack No." required />
      </div>

      <Button type="submit" disabled={isPending} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
        {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Cpu className="h-4 w-4 mr-2" />}
        Save OLT Configuration
      </Button>
    </form>
    </div>
  );
}
