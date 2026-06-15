"use client";

import React, { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { NewStatementPDF } from "./New-export-pdf-statement"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

interface ExportPdfButtonProps {
  data: any[];
  officeName: string;
  exchangeList: any[];
  summary?: {
    openingBalance?: number;
    fleetCardNumber?: string;
    lrNo?: string;
    date?: any;
    monthReport?: any;
    engineMake?: string;
    engineCapacity?: string;
    engineInstalDate?: any;
    currentStock?: number;
    totalRuntime?: number;
    totalConsumption?: number;
  };
}

export default function CompleteExportPdfButton({ data = [], officeName, exchangeList = [], summary }: ExportPdfButtonProps) {
  const [isClient, setIsClient] = useState(false);

  console.log("From Export button pdf page: ============================")

  console.log(`EngineMake: ${summary?.engineMake} <<>> Capacity: ${summary?.engineCapacity} <<>> DOI: ${summary?.engineInstalDate}`)


  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2 border-primary/20 bg-primary/5">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

   // Helper utility to safely convert any Date object to a clean string format
   const formatIfDate = (value: any): any => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
    }
    return value;
  };

  // CRITICAL FIX: Loop over every row property. If it finds a raw JavaScript Date object, 
  // convert it safely to a string ("YYYY-MM-DD") before React-PDF renders it.
  const sanitizedData = data.map((item) => {
    if (!item || typeof item !== 'object') return item;
    
    const newItem = { ...item };
    for (const key in newItem) {
      if (newItem[key] instanceof Date) {
        // Safe conversion to a string. Adjust formatting method if preferred.
        newItem[key] = newItem[key].toISOString().split('T')[0];
      }
    }
    return newItem;
  });

   // 2. FIXED: Sanitize the summary parameters to catch engineInstalDate or letter dates
   const sanitizedEngineInstalDate = formatIfDate(summary?.engineInstalDate);
   const sanitizedLetterDate = formatIfDate(summary?.date);

  return (
    <PDFDownloadLink
      document={
        <NewStatementPDF 
          data={sanitizedData} // Pass the safely stringified data array here
          officeName={officeName} 
          exchangeList={exchangeList}
          openingBalance={summary?.openingBalance}
          fleetCardNumber={summary?.fleetCardNumber || "________________"}
          engineMake={summary?.engineMake}
          engineCapacity={summary?.engineCapacity}
          engineInstalDate={sanitizedEngineInstalDate}
          monthReport={summary?.monthReport || "______-20____"}
          letterMeta={{
            lrNo: summary?.lrNo,
            date: sanitizedLetterDate
          }}
          // Fallbacks prevent undefined errors inside page summaries
          summaryMetrics={{
            currentStock: summary?.currentStock || 0,
            totalRuntime: summary?.totalRuntime || 0,
            totalConsumption: summary?.totalConsumption || 0
          }}
        />
      }
      fileName={`EMS-Report-Main-${summary?.monthReport || "Month-202X"}.pdf`}
    >
      {({ loading }) => (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={loading} 
          className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 text-primary" />
              <span>Reports.. (1st & 2nd Page)</span>
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
