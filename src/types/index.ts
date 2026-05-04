export interface User {
    id: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export type PublicUser = Omit<User, 'password_hash'>;

export interface AuthPayload {
    userId: string;
    email: string;
}

export interface Plan {
    id: string;
    user_id: string;
    name: string;
    current_age: number;
    retirement_age: number;
    annual_income: string;
    current_savings: string;
    monthly_contributions: string;
    risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
    retirement_goal: string | null;
    tfsa_balance: string;
    rrsp_balance: string;
    fhsa_balance: string;
    contribution_priority: 'tfsa_first' | 'balanced' | 'rrsp_heavy';
    created_at: Date;
    updated_at: Date;
}
