import { z } from "zod";

export const testCallSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female"]).optional(),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

export type TestCallSchema = z.infer<typeof testCallSchema>;

