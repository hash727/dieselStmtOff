// app/actions/olt.ts
"use server";

import { auth } from "@/auth";
import { encrypt } from "@/lib/encryption";
import { prisma } from "@/lib/prisma"; // Your Prisma client instance
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Validation Schema
const OltSchema = z.object({
  name: z.string().min(3, "Name is required"),
  ip: z.ipv4({ message: "Invalid IPv4 address" }),
  franchisee: z.string().min(1, "Franchisee name is required"),
  type: z.enum(["GPON", "GEPON", "EPON"]),
  make: z.string().min(1, "Manufacturer make is required"),
  installationDate: z.string(),
  outerVlan: z.number().int().min(1).max(4094),
  capacity: z.string().min(1),
  area: z.enum(["URBAN", "RURAL"]),
  location: z.string().min(1),
  description: z.string().optional(),
  sshUsername: z.string().optional(),
  sshPassword: z.string().optional(),
});

// app/actions/olt.ts
export async function saveOlt(formData: any) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const validatedData = OltSchema.parse(formData);

    // ENCRYPT THE PASSWORD
    const encryptedPassword = validatedData?.sshPassword 
      ? encrypt(validatedData?.sshPassword) 
      : null;

    // Pro-Check: Check if IP is already taken by a DIFFERENT OLT name
    const existingIp = await prisma.olt.findFirst({
      where: {
        ip: validatedData.ip,
        NOT: { name: validatedData.name } 
      }
    });

    if (existingIp) {
      return { success: false, error: `IP ${validatedData.ip} is already assigned to ${existingIp.name}` };
    }

    const olt = await prisma.olt.upsert({
      where: { ip: validatedData.ip },
      update: {
        ...validatedData,
        installationDate: new Date(validatedData.installationDate),
        sshUsername: validatedData?.sshUsername,
        sshPassword: encryptedPassword,
      },
      create: {
        ...validatedData,
        ip: validatedData.ip,
        installationDate: new Date(validatedData.installationDate),
        sshUsername: validatedData?.sshUsername,
        sshPassword: encryptedPassword,
      },
    });

    revalidatePath("/olt/manage");
    return { success: true, data: olt };
  } catch (error: any) {
    return { success: false, error: "Validation failed or Network Error" };
  }
}


export async function getOlts(){
  const session = await auth();
  if(!session?.user) return "Unauthorized";

  try{
    const olts = await prisma.olt.findMany({
      orderBy: { name: 'asc'}
    });
    return olts;
  } catch (error) {
    console.error("FETCH_OLT_ERROR:", error);
    return [];
  }
}


// OLT bulk addition
export async function bulkUploadOlts(data: any[]) {
  try {
    // Process each row from Excel
    const results = await Promise.all(
      data.map((row) => 
        prisma.olt.upsert({
          where: { ip: String(row.ip) },
          update: {
            name: String(row.name),
            franchisee: String(row.franchisee),
            type: row.type,
            make: String(row.make),
            installationDate: new Date(row.installationDate),
            outerVlan: Number(row.outerVlan),
            capacity: String(row.capacity),
            area: row.area,
            location: String(row.location),
          },
          create: {
            name: String(row.name),
            ip: String(row.ip),
            franchisee: String(row.franchisee),
            type: row.type,
            make: String(row.make),
            installationDate: new Date(row.installationDate),
            outerVlan: Number(row.outerVlan),
            capacity: String(row.capacity),
            area: row.area,
            location: String(row.location),
          },
        })
      )
    );

    revalidatePath("/olt/manage");
    return { success: true, count: results.length };
  } catch (error: any) {
    return { success: false, error: "Bulk upload failed. Check data format." };
  }
}

export async function getOltReportData() {
  try {
    const olts = await prisma.olt.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const summary = {
      total: olts.length,
      online: olts.filter(o => o.status).length,
      offline: olts.filter(o => !o.status).length,
      urban: olts.filter(o => o.area === "URBAN").length,
      rural: olts.filter(o => o.area === "RURAL").length,
    };

    return { success: true, olts, summary };
  } catch (error) {
    return { success: false, error: "Failed to generate report data" };
  }
}

export async function updateOlt(id: string, formData: any) {
  try {
    const data = { ...formData };
    
    // 1. Only encrypt and update password if a new one is provided
    if (data.sshPassword && data.sshPassword.trim() !== "") {
      data.sshPassword = encrypt(data.sshPassword);
    } else {
      delete data.sshPassword; // Don't overwrite with empty string
    }

    // 2. Convert numeric fields
    if (data.outerVlan) data.outerVlan = Number(data.outerVlan);
    if (data.installationDate) data.installationDate = new Date(data.installationDate);

    await prisma.olt.update({
      where: { id },
      data
    });

    revalidatePath("/olt/manage");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Update failed" };
  }
}