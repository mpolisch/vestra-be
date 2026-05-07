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

export interface ProjectionDataPoint {
    age: number;
    year: number;
    total_balance: number;
    tfsa_balance: number;
    rrsp_balance: number;
    fhsa_balance: number;
    unregistered_balance: number;
    yearly_contribution: number;
}

export interface ProjectionSummary {
    projected_balance_at_retirement: number;
    years_until_retirement: number;
    will_meet_goal: boolean | null;
    shortfall: number | null;
}

export interface ProjectionResponse {
    data_points: ProjectionDataPoint[];
    summary: ProjectionSummary;
}
