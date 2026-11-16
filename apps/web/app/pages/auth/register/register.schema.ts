import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(100, 'First name cannot exceed 100 characters'),

  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(100, 'Last name cannot exceed 100 characters'),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(255),

  phone: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters')
    .nullable()
    .optional(),

  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[a-z]/, 'At least one lowercase letter is required')
    .regex(/[A-Z]/, 'At least one uppercase letter is required')
    .regex(/\d/, 'At least one number is required')
    .regex(/[^A-Za-z0-9]/, 'At least one special character is required'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
