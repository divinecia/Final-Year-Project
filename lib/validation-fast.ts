// Performance optimized validation utilities
// Cached validation schemas and pre-compiled patterns for better performance

import * as z from "zod"

// Pre-compiled regex patterns for reuse
const PHONE_REGEX = /^[\+]?[0-9\-\(\)\s]*$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const NAME_REGEX = /^[a-zA-Z\s]*$/;

// Cached validation schemas (compiled once, reused many times)
export const phoneSchema = z.string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(PHONE_REGEX, "Invalid phone number format");

export const emailSchema = z.string()
  .email("Invalid email format")
  .min(1, "Email is required");

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(PASSWORD_REGEX, "Password must contain at least one uppercase letter, one lowercase letter, and one number");

export const nameSchema = z.string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must not exceed 50 characters")
  .regex(NAME_REGEX, "Name can only contain letters and spaces");

// Pre-compiled complex schemas
export const workerRegistrationSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  experience: z.string().min(1, "Experience is required"),
  location: z.string().min(1, "Location is required"),
  nationalId: z.string().length(16, "National ID must be 16 digits"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

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
});

export const bookingSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
});

// Optimized validation function with caching
const validationCache = new Map<string, any>();

export function validateForm<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
  useCache: boolean = true
): { success: boolean; data?: z.infer<T>; errors?: string[] } {
  try {
    // Use a simple hash for caching
    const cacheKey = useCache ? JSON.stringify(data) : null;
    
    if (cacheKey && validationCache.has(cacheKey)) {
      return validationCache.get(cacheKey);
    }

    const result = schema.parse(data);
    const response = { success: true, data: result };
    
    if (cacheKey) {
      validationCache.set(cacheKey, response);
    }
    
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = {
        success: false,
        errors: error.errors.map(err => err.message)
      };
      return response;
    }
    return {
      success: false,
      errors: ['Validation failed']
    };
  }
}

// Fast validation for common cases (no Zod overhead)
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone) && phone.length >= 10;
}

export function validatePassword(password: string): boolean {
  return password.length >= 8 && PASSWORD_REGEX.test(password);
}

// Clear cache when needed
export function clearValidationCache(): void {
  validationCache.clear();
}
