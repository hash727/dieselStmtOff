"use client";

import React, { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { StatementPDF } from "./reports/statement-pdf"; // Import your BSNL format

interface ExportProps {
  data: any[];
  officeName: string;
  engineSerial: string; // Add this prop
}

const ExportEngineData = ({ data, officeName, engineSerial }: ExportProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- EXCEL EXPORT (Kept as is, works great for data analysis) ---
  const exportToExcel = () => {
    // 1. Prepare data with BSNL-specific column headers
    const excelData = data.map((log) => {
      const isDiesel = log.rowType === 'DIESEL';

      const serial = engineSerial || "N/A"; 
      
      return {
        "Date": new Date(log.date).toLocaleDateString('en-GB'),
        "Log Type": isDiesel ? "DIESEL REFILL" : "ENGINE RUN",
        "Power Off Time": isDiesel 
        ? `ADDED HSD FOR ${officeName.toUpperCase()} (${serial}) WITH ${log.quantity}L` 
        : (log.powerOff ? new Date(log.powerOff).toLocaleTimeString([], { hour12: false }) : "-"),
        // These 5 columns (index 2 to 6) will be merged for Diesel rows
        // "Power Off Time": !isDiesel && log.powerOff ? new Date(log.powerOff).toLocaleTimeString([], { hour12: false }) : "-",
        "Power On Time": !isDiesel && log.powerOn ? new Date(log.powerOn).toLocaleTimeString([], { hour12: false }) : "-",
        "Run Duration (Hrs)": !isDiesel ? (log.engineRunDuration?.toFixed(2) || "0.00") : "-",
        "Meter Opening": !isDiesel ? (log.openMeterReading || "-") : "-",
        "Meter Closing": !isDiesel ? (log.closeMeterReading || "-") : "-",
        "Diesel Refilled (L)": isDiesel ? (log.quantity || 0) : 0,
        "Consumption (L)": !isDiesel ? (log.dieselConsumption?.toFixed(2) || 0) : 0,
        "Closing Stock (L)": log.runningBalance.toFixed(2),
        // "Remarks": isDiesel ? `Added HSD (Sl.No: ${log.engineSerial || 'N/A'})` : ""
      };
    });
  
    // 2. Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
  
    // --- DYNAMIC MERGE LOGIC ---
  const merges: any[] = [];
  excelData.forEach((row, index) => {
    if (row["Log Type"] === 'DIESEL REFILL') {
      // row index + 1 (to account for the header row)
      const rowIndex = index + 1; 
      merges.push({
        s: { r: rowIndex, c: 2 }, // Start: Row [index+1], Column C (index 2)
        e: { r: rowIndex, c: 6 }  // End: Row [index+1], Column G (index 6)
      });
    }
  });
  worksheet['!merges'] = merges; // Apply the merges to the worksheet

    // Set column widths so the merged text is visible
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 15 }, { wch: 45 }, { wch: 15 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
  
    // 4. Generate Workbook and Save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BSNL DG Ledger");
    
    const fileName = `BSNL_DG_Log_${officeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  

  return (
    <div className="flex gap-2">
      {/* EXCEL BUTTON */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToExcel} 
        className="flex gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>

      {/* OFFICIAL PDF BUTTON (BSNL FORMAT) */}
      {isClient && (
        <PDFDownloadLink
          document={<StatementPDF data={data} officeName={officeName} />}
          fileName={`BSNL_Report_${officeName}.pdf`}
        >
          {({ loading }) => (
            <Button 
              variant="outline" 
              size="sm" 
              disabled={loading}
              className="flex gap-2 border-red-600 text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {loading ? "Preparing..." : "Official PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default ExportEngineData;
