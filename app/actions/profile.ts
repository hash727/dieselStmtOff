"use server";

import { auth, unstable_update as update } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();

  // 1. Authorization Gate
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized access detected." };
  }

  const name = formData.get("name") as string;

  // 2. Validation
  if (!name || name.length < 3) {
    return { success: false, error: "Name must be at least 3 characters." };
  }

  try {
    // 3. Database Update
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    // 4. Session Sync (The Magic Line)
    // This updates the JWT/Session cookie so the Navbar image/name changes instantly
    await update({
      user: {
        ...session.user,
        name: updatedUser.name,
      },
    });

    // 5. Cache Invalidation
    revalidatePath("/profile");
    revalidatePath("/"); // Update Navbar across the app

    return { success: true };
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return { success: false, error: "Database synchronization failed." };
  }
}
