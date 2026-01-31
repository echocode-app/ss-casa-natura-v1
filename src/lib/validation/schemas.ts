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
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => {
    if (!value) return true;

    const trimmed = value.trim();
    const plusCount = (trimmed.match(/\+/g) ?? []).length;
    if (plusCount > 1) return false;
    if (plusCount === 1 && !trimmed.startsWith('+')) return false;

    const digits = trimmed.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
  }, 'phoneInvalid');

export const addressSchema = z.string().max(500, 'addressTooLong').optional().or(z.literal(''));

export const postalCodeITSchema = z
  .string()
  .trim()
  .min(1, 'postalCodeRequired')
  .regex(/^\d{5}$/, 'postalCodeInvalid');

export const citySchema = z.string().trim().min(1, 'cityRequired').max(120, 'fieldTooLong');

export const provinceSchema = z.string().trim().min(1, 'provinceRequired').max(120, 'fieldTooLong');

export const addressLine1Schema = z
  .string()
  .trim()
  .min(1, 'addressRequired')
  .max(200, 'fieldTooLong');

export const companySchema = z
  .string()
  .trim()
  .max(120, 'fieldTooLong')
  .optional()
  .or(z.literal(''));

export const requiredPhoneSchema = z
  .string()
  .trim()
  .min(1, 'phoneRequired')
  .refine((value) => {
    const trimmed = value.trim();
    const plusCount = (trimmed.match(/\+/g) ?? []).length;
    if (plusCount > 1) return false;
    if (plusCount === 1 && !trimmed.startsWith('+')) return false;

    const digits = trimmed.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
  }, 'phoneInvalid');

export const checkoutFormBaseSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  surname: nameSchema,
  phone: requiredPhoneSchema,

  country: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => v === 'IT', { message: 'countryInvalid' }),
  company: companySchema,
  addressLine1: addressLine1Schema,
  addressLine2: z.string().trim().max(200, 'fieldTooLong').optional().or(z.literal('')),
  postalCode: z.string().trim().min(1, 'postalCodeRequired').max(20, 'fieldTooLong'),
  city: citySchema,
  province: provinceSchema,

  marketingOptIn: z.boolean().optional(),
  shippingMethod: z.enum(['one_time', 'recurring_4w']).optional(),
});

function refineItalianPostalCode(
  data: { country?: string; postalCode?: unknown },
  ctx: z.RefinementCtx,
) {
  // Keep strict Italian CAP rules when shipping to Italy.
  if (data.country === 'IT' && !/^\d{5}$/.test(String(data.postalCode || '').trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['postalCode'],
      message: 'postalCodeInvalid',
    });
  }
}

export const checkoutFormSchema = checkoutFormBaseSchema.superRefine(refineItalianPostalCode);

export const checkoutAddressSchema = checkoutFormBaseSchema
  .pick({
    name: true,
    surname: true,
    phone: true,
    country: true,
    company: true,
    addressLine1: true,
    addressLine2: true,
    postalCode: true,
    city: true,
    province: true,
  })
  .superRefine(refineItalianPostalCode);

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

  resetPassword: z
    .object({
      newPassword: passwordSchema,
      confermaPassword: z.string().min(1, 'passwordConfirmRequired'),
    })
    .refine((data) => data.newPassword === data.confermaPassword, {
      path: ['confermaPassword'],
      message: 'passwordsNotMatch',
    }),

  changePassword: z
    .object({
      currentPassword: z.string().min(1, 'currentPasswordRequired'),
      newPassword: passwordSchema,
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      path: ['newPassword'],
      message: 'passwordsMustBeDifferent',
    }),
};

export const contactSchema = z.object({
  nome: nameSchema,
  cognome: nameSchema,
  email: emailSchema,
  telefono: phoneSchema,
  messaggio: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z.string().min(10, 'messageMinLength').max(1000, 'messageTooLong'),
  ),
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
