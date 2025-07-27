import * as z from "zod"

// Common validation schemas
export const phoneSchema = z.string()
  .trim()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must not exceed 15 digits")
  .regex(/^\+?[0-9\-()\s]{10,15}$/, "Invalid phone number format")

export const emailSchema = z.string()
  .trim()
  .email("Invalid email format")
  .nonempty("Email is required")

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")

export const nameSchema = z.string()
  .trim()
  .min
