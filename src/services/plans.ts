import { pool } from '../db.js';
import { AppError } from '../utils/AppError.js';
import type { Plan } from '../types/index.js';
import type { CreatePlanDTO, UpdatePlanDTO } from '../utils/schemas.js';

// Defence-in-depth: even though keys come from Zod, never allow arbitrary column names in SQL.
const ALLOWED_UPDATE_COLUMNS = new Set([
    'name',
    'current_age',
    'retirement_age',
    'annual_income',
    'current_savings',
    'monthly_contributions',
    'risk_tolerance',
    'retirement_goal',
    'tfsa_balance',
    'rrsp_balance',
    'fhsa_balance',
    'contribution_priority',
]);

export const getPlansByUser = async (userId: string): Promise<Plan[]> => {
    const result = await pool.query<Plan>(
        'SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
    );
    return result.rows;
};

export const createPlan = async (userId: string, data: CreatePlanDTO): Promise<Plan> => {
    const result = await pool.query<Plan>(
        `INSERT INTO plans (
            user_id, name, current_age, retirement_age, annual_income,
            current_savings, monthly_contributions, risk_tolerance,
            retirement_goal, tfsa_balance, rrsp_balance, fhsa_balance,
            contribution_priority
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
            userId,
            data.name ?? 'My Retirement Plan',
            data.current_age,
            data.retirement_age,
            data.annual_income,
            data.current_savings,
            data.monthly_contributions,
            data.risk_tolerance,
            data.retirement_goal ?? null,
            data.tfsa_balance,
            data.rrsp_balance,
            data.fhsa_balance,
            data.contribution_priority,
        ],
    );
    if (!result.rows[0]) throw new AppError('Failed to create plan', 500);
    return result.rows[0];
};

export const getPlanById = async (planId: string, userId: string): Promise<Plan> => {
    const result = await pool.query<Plan>('SELECT * FROM plans WHERE id = $1 AND user_id = $2', [
        planId,
        userId,
    ]);
    if (!result.rows[0]) throw new AppError('Plan not found', 404);
    return result.rows[0];
};

export const updatePlan = async (
    planId: string,
    userId: string,
    data: UpdatePlanDTO,
): Promise<Plan> => {
    // Ownership check + fetch existing values needed for cross-field merge.
    const existing = await getPlanById(planId, userId);

    // pg returns NUMERIC columns as strings — coerce to number before comparisons.
    const merged = {
        current_age: data.current_age ?? existing.current_age,
        retirement_age: data.retirement_age ?? existing.retirement_age,
        annual_income: data.annual_income ?? parseFloat(existing.annual_income),
        current_savings: data.current_savings ?? parseFloat(existing.current_savings),
        monthly_contributions:
            data.monthly_contributions ?? parseFloat(existing.monthly_contributions),
        retirement_goal:
            data.retirement_goal ??
            (existing.retirement_goal !== null ? parseFloat(existing.retirement_goal) : undefined),
        tfsa_balance: data.tfsa_balance ?? parseFloat(existing.tfsa_balance),
        rrsp_balance: data.rrsp_balance ?? parseFloat(existing.rrsp_balance),
        fhsa_balance: data.fhsa_balance ?? parseFloat(existing.fhsa_balance),
    };

    // Cross-field invariants on the fully merged record.
    if (merged.current_age >= merged.retirement_age) {
        throw new AppError('Retirement age must be greater than current age', 422);
    }
    if (merged.monthly_contributions * 12 > merged.annual_income) {
        throw new AppError(
            'Monthly contributions over a 12 month period cannot exceed annual income',
            422,
        );
    }
    const accountTotal = merged.tfsa_balance + merged.rrsp_balance + merged.fhsa_balance;
    if (accountTotal > merged.current_savings) {
        throw new AppError('Sum of account balances cannot exceed total current savings', 422);
    }
    if (merged.retirement_goal !== undefined && merged.retirement_goal < merged.current_savings) {
        throw new AppError('Retirement goal should be greater than current savings', 422);
    }

    // Build parameterised SET clause from the validated DTO.
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [col, value] of Object.entries(data)) {
        if (value === undefined || !ALLOWED_UPDATE_COLUMNS.has(col)) continue;
        setClauses.push(`${col} = $${idx}`);
        values.push(value);
        idx++;
    }

    // Nothing changed — return the existing plan rather than issuing a no-op UPDATE.
    if (setClauses.length === 0) return existing;

    values.push(planId, userId);

    const result = await pool.query<Plan>(
        `UPDATE plans SET ${setClauses.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
        values,
    );
    if (!result.rows[0]) throw new AppError('Failed to update plan', 500);
    return result.rows[0];
};

export const deletePlan = async (planId: string, userId: string): Promise<void> => {
    const result = await pool.query('DELETE FROM plans WHERE id = $1 AND user_id = $2', [
        planId,
        userId,
    ]);
    if (result.rowCount === 0) throw new AppError('Plan not found', 404);
};
