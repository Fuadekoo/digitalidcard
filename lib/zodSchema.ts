import { z } from "zod";

export const loginSchema = z.object({
  username: z.string({}).nonempty("username is required").default(""),
  password: z.string({}).nonempty("password is required").default(""),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const passwordSchema = z.object({
  password: z.string().nonempty("password is required"),
  confirmPassword: z.string().nonempty("password didn't match"),
});
export type PasswordSchema = z.infer<typeof passwordSchema>;

export const usernameSchema = z.object({
  username: z.string().nonempty("username is required"),
});
export type UsernameSchema = z.infer<typeof usernameSchema>;

export const stationSchema = z.object({
  code: z.string().nonempty("code is required"),
  afanOromoName: z.string().nonempty("afan oromo name is required"),
  amharicName: z.string().nonempty("amharic name is required"),
  stationAdminName: z.string().nonempty("station admin name is required"),
  stampPhoto: z.string().nonempty("stamp photo is required"),
  signPhoto: z.string().nonempty("sign photo is required"),
});
export type StationSchema = z.infer<typeof stationSchema>;
