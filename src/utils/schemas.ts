import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email('Invalid email format')),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .refine((s) => !s.includes(' '), 'Password cannot contain spaces')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Automatically infer the type from the schema
export type RegisterDTO = z.infer<typeof registerSchema>;
