// Add this function to your lib/report-exporter.ts file
import * as XLSX from "xlsx";
import { format } from "date-fns";

export function exportAlphionInventoryToExcel(
  oltName: string,
  oltIp: string,
  activeSlot: string,
  activePonPort: string | null,
  onus: any[],
  powerData: Record<string, string>
) {
  // 1. Sanitize data rows explicitly matching Alphion GPON parameters arrays
  const worksheetData = onus.map((o) => {
    const powerValue = powerData[o.pon] || "--"; // Alphion keys directly by pon e.g., '1/2/4'
    const ponParts = o.pon.split("/"); // Splitting 'Slot/Port/ONU_Id'
    
    return {
      "PON NO": ponParts[0] || activeSlot,
    //   "PON PORT": ponParts[1] || "1",
      "ONU ID": ponParts[1] || o.id || "--",
      "SUBSCRIBER ACCOUNT": o.account ? o.account.toUpperCase() : "UNASSIGNED",
      "SERIAL NUMBER (AUTH)": o.sn ? o.sn.toUpperCase() : "N/A",
      "ONU DESCRIPTOR NAME": o.name || "STANDARD ONT",
      "HARDWARE PROFILE": o.model || "DEFAULT",
      "OPTICS LEVEL (RX)": powerValue,
      "OPERATIONAL STATUS": o.status ? o.status.toUpperCase() : "OFFLINE",
    };
  });

  // 2. Compile elements layout sheets structure matrices
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  const sheetName = `Slot_${activeSlot}_Inventory`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

  // 3. Dynamic width padding scanner loop to prevent truncation clipping (### error)
  const columnWidths = Object.keys(worksheetData[0] || {}).map((key) => {
    const maxCellLength = Math.max(
      key.length,
      ...worksheetData.map((row: any) => (row[key] ? row[key].toString().length : 0))
    );
    return { wch: maxCellLength + 3 }; // Safe border buffer padding clearance cells bounds
  });
  worksheet["!cols"] = columnWidths;

  // 4. Trigger filesystem window saves prompt
  const dateStamp = format(new Date(), "yyyy_MM_dd");
  const fileName = `ALPHION_OLT_${oltName.replace(/\s+/g, "_")}_Slot_${activeSlot}_Report_${dateStamp}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
}
