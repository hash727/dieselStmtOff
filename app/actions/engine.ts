"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// import { ActionState } from "@/lib/type";
import { EngineActionState } from "@/types/engine";
import { getMonthlySummary } from "@/utils/diesel-logic";

export async function saveEngineLog(
  prevState: EngineActionState,
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const dateStr = formData.get("date") as string;
    const openMeter = parseFloat(formData.get("openMeter") as string);
    const officeId = formData.get("officeId") as string;

    if (!dateStr || !officeId) {
      return { success: false, error: "Date and Office are required" };
    }

    // Fetch the latest log to verify the meter sequence
    const lastLog = await prisma.engineLog.findFirst({
      where: { officeId },
      orderBy: { date: "desc" },
      select: {
        closeMeterReading: true,
        openingDiesel: true,
        dieselConsumption: true,
      },
    });

    const lastClosing = lastLog?.closeMeterReading ?? 0;

    if (lastLog && openMeter < lastClosing) {
      return {
        success: false,
        error: `Invalid Meter: Opening value cannot be less than the last closing (${lastLog.closeMeterReading})`,
      };
    }

    // 2. Calculate the NEW opening balance for THIS entry
    // If no previous log exists, fallback to an initial manual value or 0
    const calculatedOpeningDiesel = lastLog
      ? (lastLog.openingDiesel || 0) - (lastLog.dieselConsumption || 0)
      : parseFloat(formData.get("openingDiesel") as string) || 0;

    //  Fetch Engine Details for the office
    const officeEngine = await prisma.engine.findUnique({
      where: { officeId },
    });

    const logDate = new Date(dateStr);

    // Helper to pars time sting into date objects
    const parseTime = (key: string) => {
      const val = formData.get(key);
      return val ? new Date(`${dateStr}T${val}`) : null;
    };

    const pOff = parseTime("powerOff");
    const eOn = parseTime("engineOn");
    const pOn = parseTime("powerOn");
    const eOff = parseTime("engineOff");

    // Duration calculations (in Hours)
    const powerCutDuration =
      pOff && pOn ? (pOn.getTime() - pOff.getTime()) / (1000 * 60 * 60) : 0;

    const engineRunDuration = eOn && eOff 
      ? Math.max(0, (eOff.getTime() - eOn.getTime()) / (1000 * 60 * 60)) 
      : 0;

    // Diesel Consumption
    const consumption = officeEngine && officeEngine.consumptionRate > 0
      ? engineRunDuration * officeEngine.consumptionRate
      : 0;

    // check to prevent saving if consumption should have been there
    if(engineRunDuration > 0 && consumption === 0){
      return { success: false, error: "Engine Profile consumption rate is set to 0. Please update Engine Profile first."}
    }

    // Check for Duplicate entry (Sate Date)
    const existingLog = await prisma.engineLog.findFirst({
      where: {
        date: logDate,
        userId: session.user.id,
        officeId: officeId,
        // Add specific time checks
        powerOff: pOff,
        engineOn: eOn,
        powerOn: pOn,
        engineOff: eOff,
      },
    });

    if (existingLog) {
      return {
        sucess: false,
        error:
          "An identical log entry (same times) for the day already exists.",
      };
    }

    const ONE_MIN_MS = 60000;

    //  ---- vALIDATION LOGIC ----

    // 1. Engine on muyst be at leaset 1 min after power off
    if (pOff && eOn && eOn.getTime() - pOff.getTime() < ONE_MIN_MS) {
      return {
        success: false,
        error: "Engine On must be at leaset 1 min after power off",
      };
    }

    // 2. Power on must be after engine on
    if (eOn && pOn && pOn.getTime() <= eOn.getTime()) {
      return { success: false, error: "Power On must be after Engine On" };
    }

    // --- Database Operations ---
    const data = {
      powerOff: pOff,
      engineOn: eOn,
      powerOn: pOn,
      engineOff: eOff,
      powerCutDuration: parseFloat(powerCutDuration.toFixed(2)),
      engineRunDuration: parseFloat(engineRunDuration.toFixed(2)),
      openMeterReading: parseFloat(formData.get("openMeter") as string),
      closeMeterReading: parseFloat(formData.get("closeMeter") as string),
      openingDiesel: calculatedOpeningDiesel,
      dieselConsumption: consumption,
    };

    await prisma.engineLog.create({
      data: {
        date: pOff || new Date(dateStr),
        ...data,
        userId: session.user.id,
        officeId: officeId,
      }
    });

    revalidatePath("/dashboard/engine"); // Instantly refresh the table
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to save data" };
  }
}

export async function deleteEnginelog(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // Delete only if it belongs to the current user
    await prisma.engineLog.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/engine");
    return { success: true };
  } catch (error) {
    console.error("Error deleting log: ", error);
    return { success: false, error: "Failed to delete log" };
  }
}

export async function deleteLog(id: string, type: 'ENGINE' | 'DIESEL'){
  const session = await auth()
  if(!session?.user?.id) throw new Error("Unauthorized")
  
  try {
    if(type === 'ENGINE'){
      await prisma.engineLog.delete({
        where: {
          id,
          officeId: session.user.officeId
        }
      })
    } else {
      await prisma.dieselLog.delete({
        where: {
          id,
          officeId: session.user.officeId
        }
      })
    }

    revalidatePath("/dashboard/engine")
    return { success: true }
  } catch (error) {
    console.error("Delete Error:", error)
    throw new Error("Failed to delete the record")
  }
}

export async function updateEngineProfile(officeId: string, data: any) {
  console.log("Update Engine Profile: ", data);
  const session = await auth(); // Get the current user session
  if(!session?.user?.id) return { success: false, error: "Unauthorized"}

  try {
    // fix the typo and ensure it's a number
    const formattedData = {
      make: data.make,
      capacity: data.capacity,
      serialNumber: data.serialNumber,

      // Fix the typo here: use the correct Prisma field name
      consumptionRate: parseFloat(
        data.consumptionRate || data.consupmtionRate || 0,
      ),
      installationDate: data.installationDate
        ? new Date(data.installationDate)
        : new Date(),
      lastServiceDate: data.lastServiceDate
        ? new Date(data.lastServiceDate)
        : new Date(),
      lastServiceHours: parseFloat(
        data.lastServiceHours || 0
      ),
      updatedById: session.user.id, // Store who is making the change
    };
    // Remove the type field to keep the data clean
    // delete formattedData.consumptionRate;

    if(formattedData.consumptionRate <= 0){
      console.warn("Warning: Consumption rate set to 0. Logs will result in 0L consumption")
    }

    console.log("Formatted data: ", formattedData);
    await prisma.engine.upsert({
      where: { officeId },
      update: formattedData,
      create: {
        ...formattedData,
        officeId,
        // installationDate: data.installationDate || new Date(),
      },
    });
    revalidatePath("/dashboard/engine");
    return { success: true };
  } catch (error) {
    console.error("DB Error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function addDieselRefill(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthothorized " };

  try {
    const quantity = parseFloat(formData.get("quantity") as string);
    const date = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const officeId = formData.get("officeId") as string;

    // Combine date and time into a singe JS date object
    const fullRefillDate = new Date(`${date}T${timeStr}`);

    if (!quantity || !date || !officeId) {
      return { success: false, error: "All fields are required" };
    }

    // Basic Validation to prevent NaN in DB
    if (isNaN(quantity) || quantity <= 0) {
      return { success: false, error: "Please enter a valid diesel quantity" };
    }

    const newRefill = await prisma.dieselLog.create({
      data: {
        date: fullRefillDate,
        quantity: quantity,
        userId: session.user.id,
        officeId,
      },
      include: {
        office: {
          include: {
            engine: true
          }
        }
      }
    });

    const officeName = newRefill.office?.name || "Unknown Office";
    const serialNo = newRefill.office?.engine?.serialNumber || "N/A";

    revalidatePath("/dashboard/engine"); //Refreshes the ledger
    return { 
      success: true ,
      message: `ADDED HSD FOR ${officeName.toUpperCase()} (${serialNo}) WITH ${quantity}L`,
    }
  } catch (error) {
    console.error("Diesel Addition error: ", error);
    return { success: false, error: "Failed to add diesel refill" };
  }
}

export async function freezeMonth(
  officeId: string,
  month: number,
  year: number,
) {
  // 1. Calculate the final summary for the current month
  const summary = await getMonthlySummary(officeId, month, year);

  // 2. Update current month to "Frozen" and save the closing balance
  await prisma.monthlyBalance.update({
    where: { officeId_month_year: { officeId, month, year } },
    data: {
      closingBalance: summary.closingBalance,
      isFrozen: true,
    },
  });

  // 3. Create the Opening Balance for the NEXT month
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  await prisma.monthlyBalance.upsert({
    where: {
      officeId_month_year: { officeId, month: nextMonth, year: nextYear },
    },
    update: { openingBalance: summary.closingBalance },
    create: {
      officeId,
      month: nextMonth,
      year: nextYear,
      openingBalance: summary.closingBalance,
    },
  });

  revalidatePath("/dashboard/engine");
}


// app/actions/engine.ts
export async function resetMonthlyStock(officeId: string, liters: number) {
  const now = new Date();
  try {
    await prisma.monthlyBalance.upsert({
      where: {
        officeId_month_year: {
          officeId,
          month: now.getMonth() + 1,
          year: now.getFullYear()
        }
      },
      update: { openingBalance: liters },
      create: {
        officeId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        openingBalance: liters
      }
    });
    revalidatePath("/dashboard/engine");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}


export async function closeMonthlyBalance(officeId: string, month: number, year: number, finalStock: number) {
  try {
    // 1. Update current month's closing balance
    await prisma.monthlyBalance.update({
      where: {
        officeId_month_year: { officeId, month, year },
      },
      data: { closingBalance: finalStock },
    });

    // 2. Automatically create/update next month's opening balance (Carry Forward)
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    await prisma.monthlyBalance.upsert({
      where: {
        officeId_month_year: { officeId, month: nextMonth, year: nextYear },
      },
      update: { openingBalance: finalStock },
      create: {
        officeId,
        month: nextMonth,
        year: nextYear,
        openingBalance: finalStock,
      },
    });

    revalidatePath("/dashboard/engine");
    return { success: true };
  } catch (error) {
    console.error("Failed to close month:", error);
    return { success: false, error: "Failed to update closing balance" };
  }
}

export async function updateOpeningBalance(formData: FormData) {
  const officeId = formData.get("officeId") as string;
  const month = parseInt(formData.get("month") as string);
  const year = parseInt(formData.get("year") as string);
  const amount = parseFloat(formData.get("amount") as string);

  try {
    await prisma.monthlyBalance.upsert({
      where: { officeId_month_year: { officeId, month, year } },
      update: { openingBalance: amount },
      create: { officeId, month, year, openingBalance: amount }
    });
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/engine");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update database" };
  }
}