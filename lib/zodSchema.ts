import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(4, "username is too short"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type LoginType = z.infer<typeof loginSchema>;
