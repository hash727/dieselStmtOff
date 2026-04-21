// app/actions/office-actions.ts
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function setActiveOffice(officeId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false }

  try {
    // 1. Update the user's active office in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeOfficeId: officeId }
    })

    // 2. Clear the cache for the engine page to force a fresh fetch
    revalidatePath("/","layout");
    
    return { success: true }
  } catch (error) {
    console.error("Failed to switch office:", error)
    return { success: false }
  }
}
