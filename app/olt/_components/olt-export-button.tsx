// app/olt/_components/olt-export-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export default function OltExportButton({ data }: { data: any[] }) {
  const exportToExcel = () => {
    // 1. Prepare and Clean Data for Excel
    const worksheetData = data.map((olt) => ({
      "OLT Name": olt.name,
      "IP Address": olt.ip,
      "Franchisee (TIP)": olt.franchisee,
      "Type": olt.type,
      "Make": olt.make,
      "VLAN": olt.outerVlan,
      "Capacity": olt.capacity,
      "Area": olt.area,
      "Location": olt.location,
      "Description": olt.description || "N/A",
      "Status": olt.status ? "Online" : "Offline",
      "Installation Date": format(new Date(olt.installationDate), "dd-MMM-yyyy"),
      "Registered On": format(new Date(olt.createdAt), "dd-MMM-yyyy HH:mm"),
    }));

    // 2. Create Workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OLT Inventory Report");

    // 3. Trigger Download
    const fileName = `OLT_Inventory_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button 
      onClick={exportToExcel}
      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase shadow-lg shadow-emerald-500/20"
    >
      <FileDown className="mr-2 h-4 w-4" /> Export Excel
    </Button>
  );
}
