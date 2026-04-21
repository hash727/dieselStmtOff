// app/actions/onboarding.ts
"use server";
import { prisma } from "@/lib/prisma";
import { auth, unstable_update as update } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOffice(formData: FormData) {
  const session = await auth()
  
  // 1. Authorization Check (Optional: check for an 'ADMIN' role if you have one)
  if (!session?.user) throw new Error("Unauthorized")
  
  if(session?.user?.role !== "ADMIN"){
    throw new Error("Forbiden: Admin access required.")
  }

  const name = formData.get("name") as string
  const location = formData.get("location") as string

  if (!name) return { error: "Office name is required" }

  try {
    await prisma.office.create({
      data: {
        name,
        location,
      },
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "An office with this name already exists." }
    }
    return { error: "Failed to create office." }
  }

  revalidatePath("/admin/offices")
  redirect("/dashboard") // Or back to the office list
}

export async function updateOffice(formData: FormData) {
  const session = await auth();
  const officeId = formData.get("officeId") as string;

  console.log("SESSION CHECK:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    officeId: session?.user?.activeOfficeId
  })

  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!officeId) throw new Error("Office selection is required");

  try {
    
  
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        activeOfficeId: officeId,
        
        offices: {
          set: [{ id: officeId }] // This replaces any existing offices with this one
        }
       },
    });

    // 2. update the JWT session cookie manually
    // This sends  command to the browser to refresh its token
    await update({
      user: {
        ...session.user,
        activeOfficeId: officeId ?? undefined,
      },
    });

  } catch (error) {
    console.error("Onboarding Error:", error);
    throw new Error("Failed to update office selection");
  }
  // Revalidate so middleware sees the new officeId immediately
  revalidatePath("/", "layout");
  redirect("/dashboard/engine");
}

export async function updateUserOffices(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Get all selected IDs as an array
  const officeIds = formData.getAll("officeIds") as string[]

  if(!officeIds || officeIds.length === 0){
    return { error: "Please select at least one office."}
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        offices: {
          // 'set' removes old connections and adds these new ones
          set: officeIds.map(id => ({ id })) 
        },
      },
      include: {
        offices: true, // Fetch updated List for the session update
      }
    })

    // Update the Session (JWT)
    // pick the first office as the "default office"
    await update({
      user: {
        ...session.user,
        assignedOffices: updatedUser.offices,
        activeOfficeId: updatedUser.offices[0]?.id,
        officeId: updatedUser.offices[0].id,
      },
    })
    
    revalidatePath("/", "layout")

  } catch (error: any) {
    console.error("MANY-TO-MANY UPDATE ERROR:", error.message);
    return { error: "Database update failed. Ensure IDs are valid UUIDs." }
  }

  

  redirect("/dashboard/engine")
}


// app/actions/onboarding.ts

export async function getOnboardingOffices() {
  const session = await auth();
  if (!session?.user?.id) {
    console.error("DEBUG: No session found in getOnboardingOffices");
    throw new Error("Unauthorized: Please log in again.");
  }

  // ADMIN: Fetch every office in the system
  if (session.user.role === "ADMIN") {
    return await prisma.office.findMany({
      orderBy: { name: 'asc' }
    });
  }

  // USER: Fetch only the offices already assigned to this user in the DB
  const userWithOffices = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      offices: {
        orderBy: { name: 'asc' }
      }
    }
  });

  return userWithOffices?.offices || [];
}
