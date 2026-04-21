"use server";

import { signupSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ActionState } from "@/lib/type";

export async function registerUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Validate the inputs
  if (!formData) {
    return { success: false, message: "No Form data received " };
  }

  //   convert Form Data to a plain object safely
  const rawData = Object.fromEntries(formData.entries());

  const result = signupSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { username, password, officeId } = result.data;

  //   check if office exists
  const officeExists = await prisma.office.findUnique({
    where: { id: officeId },
  });

  if (!officeExists) {
    return {
      success: false,
      errors: { officeId: ["The provided office ID does not exist."] },
    };
  }

  // 2. check if user exists
  const existingUser = await prisma?.user.findUnique({
    where: { username },
  });
  if (existingUser)
    return {
      errors: {
        username: ["Username already taken"]
      },
    };

  // 3. Hash and Save

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma?.user.create({
    data: { 
      username, 
      password: hashedPassword, 
      offices: {
        connect: { id: officeId }
      },
      // Also set the initial active office preference
      activeOfficeId: officeId  
    },
  });

  return { success: true, message: "User Created Successfully" };
}
