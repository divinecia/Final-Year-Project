import * as z from "zod"

// Common validation schemas
export const phoneSchema = z.string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^[\+]?[0-9\-\(\)\s]*$/, "Invalid phone number format")

export const emailSchema = z.string()
  .email("Invalid email format")
  .min(1, "Email is required")

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")

export const nameSchema = z.string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must not exceed 50 characters")
  .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces")

// Booking validation
export const bookingSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
})

// User registration schemas
export const workerRegistrationSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  experience: z.string().min(1, "Experience is required"),
  location: z.string().min(1, "Location is required"),
  nationalId: z.string().min(16, "National ID must be 16 digits").max(16, "National ID must be 16 digits"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const householdRegistrationSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  location: z.string().min(1, "Location is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Review schema
export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(500, "Comment cannot exceed 500 characters"),
  bookingId: z.string().min(1, "Booking ID is required"),
})

// Payment schema
export const paymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  method: z.enum(["card", "mobile_money", "bank_transfer"]),
  phoneNumber: phoneSchema.optional(),
})

// Settings schema
export const profileUpdateSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  location: z.string().min(1, "Location is required"),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
})

// Form helper functions
export function getFieldError(errors: any, fieldName: string): string | undefined {
  return errors?.[fieldName]?.message
}

export function validateForm<T>(schema: z.ZodSchema<T>, data: any): { success: boolean; data?: T; errors?: any } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, curr) => {
        acc[curr.path[0]] = { message: curr.message }
        return acc
      }, {} as any)
      return { success: false, errors }
    }
    return { success: false, errors: { general: { message: "Validation failed" } } }
  }
}
