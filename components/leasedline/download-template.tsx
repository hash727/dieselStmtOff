"use client";

import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";

export default function DownloadTemplate() {
  const downloadExcelTemplate = () => {
    // 1. Define the exact columns as per your requirements
    const columns = [
      "S.no.", "SDCA", "CUSTOMERS NAME", "LC ID", "Billing A/c.no.",
      "D.O.C", "WAN IP", "SUBNET", "GATEWAY", "V-LAN", "VRF",
      "Service type", "Bandwidth", "media", "Contact Number", "BSNL/TIP"
    ];

    // 2. Add one sample row so the user knows what to fill
    const sampleData = [
      {
        "S.no.": 1,
        "SDCA": "BALLARI",
        "CUSTOMERS NAME": "Sample Corp Ltd",
        "LC ID": "LC_BLR_001",
        "Billing A/c.no.": "1002345678",
        "D.O.C": "01/01/2024",
        "WAN IP": "10.1.1.2",
        "SUBNET": "255.255.255.252",
        "GATEWAY": "10.1.1.1",
        "V-LAN": "100",
        "VRF": "BSNL_VRF",
        "Service type": "MPLS",
        "Bandwidth": "100 Mbps",
        "media": "OFC",
        "Contact Number": "9448012345",
        "BSNL/TIP": "BSNL"
      }
    ];

    // 3. Create Workbook and Worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: columns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LeasedLine_Template");

    // 4. Trigger the download
    XLSX.writeFile(workbook, "LeasedLine_Import_Template.xlsx");
  };

  return (
    <Button 
      variant="outline" 
      onClick={downloadExcelTemplate} 
      className="flex gap-2 border-bsnl-blue text-bsnl-blue hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
    >
      <DownloadCloud className="h-4 w-4" />
      Download Template
    </Button>
  );
}
