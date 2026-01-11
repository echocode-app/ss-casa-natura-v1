import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'passwordMinLength')
  .regex(/[A-Z]/, 'passwordUppercase')
  .regex(/[a-z]/, 'passwordLowercase')
  .regex(/[0-9]/, 'passwordNumber');

export const emailSchema = z.string().email('invalidEmail').min(1, 'emailRequired');

export const nameSchema = z
  .string()
  .min(1, 'nameRequired')
  .max(100, 'nameTooLong')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'nameInvalidChars');

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9\s\-()]{8,20}$/, 'phoneInvalid')
  .optional()
  .or(z.literal(''));

export const addressSchema = z.string().max(500, 'addressTooLong').optional().or(z.literal(''));

export const authSchemas = {
  login: z.object({
    email: emailSchema,
    password: z.string().min(1, 'passwordRequired'),
  }),

  register: z.object({
    nome: nameSchema,
    cognome: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confermaPassword: z.string().min(1, 'passwordConfirmRequired'),
  }),

  forgotPassword: z.object({
    email: emailSchema,
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'currentPasswordRequired'),
    newPassword: passwordSchema,
  }),
};

export const contactSchema = z.object({
  nome: nameSchema,
  cognome: nameSchema,
  email: emailSchema,
  telefono: phoneSchema,
  messaggio: z.string().min(10, 'messageMinLength').max(1000, 'messageTooLong'),
});

export const profileSchema = z.object({
  nome: nameSchema.optional(),
  cognome: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  deliveryAddress: addressSchema,
});

export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((err: z.ZodIssue) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return { success: false, errors };
}
