import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DefaultValues, FieldValues, FormState } from "react-hook-form";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormErrors<TFieldValues extends FieldValues>(
  formState: FormState<TFieldValues>
): { [Key in keyof TFieldValues]: string } {
  return Object.entries(formState.errors).reduce(
    (acc, [n, v]) => ({ ...acc, [n]: v?.message }),
    {} as { [Key in keyof TFieldValues]: string }
  );
}

export function getDefaults<
  T extends z.ZodTypeAny,
  TFieldValues extends FieldValues = FieldValues
>(
  schema: T
):
  | DefaultValues<TFieldValues>
  | ((payload?: unknown) => Promise<TFieldValues>)
  | undefined {
  if (schema instanceof z.ZodDefault) {
    const defaultValue = schema._def.defaultValue;
    return typeof defaultValue === "function"
      ? defaultValue()
      : (defaultValue as any);
  } else if (schema instanceof z.ZodObject) {
    return Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => [
        key,
        getDefaults(value as z.ZodTypeAny),
      ])
    ) as DefaultValues<TFieldValues>;
  }
  return undefined;
}
