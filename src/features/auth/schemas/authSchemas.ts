import { z } from 'zod';

/**
 * Mêmes règles que l'API (RegisterDto). Les messages sont des clés de
 * traduction, affichées avec t().
 */
const email = z.string().trim().min(1, 'validation.required').email('validation.email');
const password = z
  .string()
  .min(8, 'validation.password')
  .max(128, 'validation.password')
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'validation.password');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'validation.required'),
});

export const registerSchema = z.object({
  displayName: z.string().trim().max(80).optional(),
  email,
  password,
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'validation.acceptTerms' }) }),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'validation.passwordMismatch' });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
