"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";

export async function importLeasedLines(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "No file uploaded" };

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true }); // cellDates: true helps with some formats
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Use defval: null to handle empty cells consistently
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    // Filter out rows where the first column (S.No) is empty or not a number
    const rows = rawData.slice(1).filter(row => row[0] !== null && !isNaN(parseInt(row[0])));

    const dataToInsert = rows.map((row) => {
      // Helper to handle Excel's weird date serial numbers
      const parseExcelDate = (val: any) => {
        if (val instanceof Date && !isNaN(val.getTime())) return val;
        if (typeof val === 'number') {
          return new Date(Math.round((val - 25569) * 86400 * 1000));
        }
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d; // Fallback to current date if invalid
      };

      return {
        sNo: parseInt(row[0]),
        sdca: row[1]?.toString() || "",
        customerName: row[2]?.toString() || "",
        lcId: row[3]?.toString() || "",
        billingAcNo: row[4]?.toString() || "",
        doc: parseExcelDate(row[5]), // Correctly handles serial numbers
        wanIp: row[6]?.toString() || "",
        subnet: row[7]?.toString() || "",
        gateway: row[8]?.toString() || "",
        vlan: row[9]?.toString() || "",
        vrf: row[10]?.toString() || "",
        serviceType: row[11]?.toString() || "",
        bandwidth: row[12]?.toString() || "",
        media: row[13]?.toString() || "",
        contactNumber: row[14]?.toString() || "",
        bsnlTip: row[15]?.toString() || "",
      };
    });

    if (dataToInsert.length === 0) return { error: "No valid data rows found" };

    const result = await prisma.leasedLine.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    revalidatePath("/leasedlines");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Import Error:", error);
    return { error: "Failed to parse Excel file. Check date formats." };
  }
}


export async function clearLeasedLines() {
  try {
    // Truncate is fast and resets IDs to 1
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "LeasedLine" RESTART IDENTITY CASCADE;`);
    
    revalidatePath("/leasedlines");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to clear database." };
  }
}
