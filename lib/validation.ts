import { z } from "zod";

// Registration validation
export const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at leaset 3 characters"),
    officeId: z.string().min(1, "Please select an office"),
    password: z
      .string()
      .min(8, "Password must be at leaset 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"], // Highlighting the error on the confiramtion password field
  });

// Diesel Entry Validation
export const dieselSchema = z.object({
  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than 0")
    .max(500, "Quantity seems too high"), // safety limit 500L
  date: z.string().min(1, "Date is required"),
});

export const engineProfileSchema = z.object({
  make: z.string().min(2, "Make is required"),
  capacity: z.string().min(1, "Capacity is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  installationDate: z.date({ error: "Installation date is required" }),
  lastServiceDate: z.date({ error: "Last service date is required" }),
  consumptionRate: z.coerce.number().min(0, "Rate must be a positive number"),
});

export type EngineFormValues = z.infer<typeof engineProfileSchema>;
