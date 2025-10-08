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

export const userSchema = z.object({
  username: z.string().nonempty("username is required"),
  password: z.string().nonempty("password is required"),
  phone: z.string().nonempty("phone is required"),
  role: z.string().nonempty("role is required"),
  stationId: z.string(),
});
export type userType = z.infer<typeof userSchema>;

export const orderSchema = z.object({
  citizenId: z.string().nonempty("citizen id is required"),
  orderType: z.string().nonempty("order type is required"),
  orderStatus: z.string().nonempty("order status is required"),
  paymentMethod: z.string().nonempty("payment method is required"),
  paymentReference: z.string().nonempty("payment reference is required"),
  amount: z.number().int().positive("amount is required"),
  registrarId: z.string().nonempty("registrar id is required"),
});
export type OrderSchema = z.infer<typeof orderSchema>;
