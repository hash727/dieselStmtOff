"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { StatementPDF } from "./statement-pdf";
import { Button } from "@/components/ui/button";
import { FileDown, FileDownIcon, Loader2 } from "lucide-react";
import { NewStatementPDF } from "./new-statement-pdf";

export default function ExportPdfButton({ data, officeName, summary }: any) {
  return (
    <PDFDownloadLink
      document={<NewStatementPDF data={data} 
      officeName={officeName} 
      summary={summary} />}
      fileName={`EMS-Statement-${officeName}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading} className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4 text-blue-500" />}
          Download Statement : <span className="text-blue-500">{officeName ? ` ${officeName}` : ""}</span>
          {/* <FileDown className="h-4 w-4 text-blue-500" /> */}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
