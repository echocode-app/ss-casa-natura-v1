import { z } from 'zod';

export function formatFieldErrors(
  errors: z.ZodError,
  t: (key: string) => string,
): Record<string, string> {
  const formatted: Record<string, string> = {};

  errors.issues.forEach((err: z.ZodIssue) => {
    const field = err.path[0]?.toString() || 'general';
    formatted[field] = t(err.message);
  });

  return formatted;
}

export function validateField<T extends z.ZodObject<any>>(
  schema: T,
  fieldName: string,
  value: unknown,
  t: (key: string) => string,
): string | null {
  try {
    const shape = schema.shape as Record<string, z.ZodSchema>;
    if (shape && fieldName in shape) {
      const fieldSchema = shape[fieldName];
      fieldSchema.parse(value);
      return null;
    }
  } catch (err) {
    if (err instanceof z.ZodError && err.issues.length > 0) {
      return t(err.issues[0].message);
    }
  }

  return null;
}
