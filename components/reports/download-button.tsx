"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { StatementPDF } from "./statement-pdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DownloadReportButton({
   data, 
   officeName, 
   month, 
   year, 
   openingBalance,
  }: any) {
  const [isClient, setIsClient] = useState(false);

  // Only render on the client to avoid the "Node specific API" error
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <Button disabled>Loading PDF...</Button>;

  return (
    <PDFDownloadLink
      document={
      <StatementPDF 
        data={data} 
        officeName={officeName} 
        openingBalance={openingBalance}
        month={month}
        year={year}
      />
    }
      fileName={`BSNL_Report_${officeName}_${month}_${year}.pdf`}
    >
      {({ loading }) => (
        <Button variant="default" className="bg-orange-600 hover:bg-orange-700" disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
