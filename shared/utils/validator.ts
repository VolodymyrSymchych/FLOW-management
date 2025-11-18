import { z } from 'zod';

// Common validation schemas
export const idSchema = z.number().int().positive();
export const emailSchema = z.string().email();
export const urlSchema = z.string().url();
export const dateSchema = z.coerce.date();
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Validation helper
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Safe validation (returns result instead of throwing)
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

// Request validation middleware helper
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    return validate(schema, data);
  };
}

