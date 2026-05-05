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

export type RegisterDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email('Invalid email format')),
    password: z.string().min(1, 'Password is required'),
});

export type LoginDTO = z.infer<typeof loginSchema>;

export const planBaseSchema = z.object({
    name: z.string().trim().max(100, 'Plan name is too long').optional(),
    current_age: z
        .number()
        .int('Age must be a whole number')
        .min(18, 'Must be at least 18')
        .max(80, 'Must be 80 or under'),
    retirement_age: z
        .number()
        .int('Age must be a whole number')
        .min(30, 'Retirement age must be at least 30')
        .max(90, 'Retirement age must be 90 or under'),
    annual_income: z.number().positive('Annual income must be positive'),
    current_savings: z.number().min(0, 'Current savings cannot be negative'),
    monthly_contributions: z.number().positive('Monthly contributions must be positive'),
    risk_tolerance: z.enum(['conservative', 'moderate', 'aggressive'], {
        error: 'Invalid risk tolerance',
    }),
    retirement_goal: z.number().positive('Retirement goal must be positive').optional(),
    tfsa_balance: z.number().min(0, 'TFSA balance cannot be negative'),
    rrsp_balance: z.number().min(0, 'RRSP balance cannot be negative'),
    fhsa_balance: z.number().min(0, 'FHSA balance cannot be negative'),
    contribution_priority: z
        .enum(['tfsa_first', 'balanced', 'rrsp_heavy'], {
            error: 'Invalid contribution priority',
        })
        .default('tfsa_first'),
});

export const createPlanSchema = planBaseSchema.superRefine((data, ctx) => {
    //Age validation
    if (data.current_age >= data.retirement_age) {
        ctx.addIssue({
            code: 'custom',
            message: 'Retirement age must be greater than current age',
            path: ['retirement_age'],
        });
    }

    //Income vs. contributions
    if (data.monthly_contributions * 12 > data.annual_income) {
        ctx.addIssue({
            code: 'custom',
            message: 'Monthly contributions over a 12 month period cannot exceed annual income',
            path: ['monthly_contributions'],
        });
    }

    //Account balances vs. total savings
    const accountTotal = data.tfsa_balance + data.rrsp_balance + data.fhsa_balance;
    if (accountTotal > data.current_savings) {
        ctx.addIssue({
            code: 'custom',
            message: 'Sum of account balances cannot exceed total current savings',
            path: ['current_savings'],
        });
    }

    //Retirement goal vs. current savings
    if (data.retirement_goal !== undefined && data.retirement_goal < data.current_savings) {
        ctx.addIssue({
            code: 'custom',
            message: 'Retirement goal should be greater than current savings',
            path: ['retirement_goal'],
        });
    }
});

// Cross-field invariants (age gap, income vs contributions, balance totals, retirement goal)
// cannot be safely validated here because PATCH payloads are partial — we only see the fields
// being changed, not the full record. Validation must happen in the plan service after merging
// the incoming fields with the existing DB row.
export const updatePlanSchema = planBaseSchema.partial();

export type CreatePlanDTO = z.infer<typeof createPlanSchema>;
export type UpdatePlanDTO = z.infer<typeof updatePlanSchema>;
