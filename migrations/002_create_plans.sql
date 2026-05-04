BEGIN;

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'My Retirement Plan',
    current_age INT NOT NULL,
    retirement_age INT NOT NULL,
    annual_income DECIMAL(12,2) NOT NULL,
    current_savings DECIMAL(12,2) NOT NULL,
    monthly_contributions DECIMAL(12,2) NOT NULL,
    risk_tolerance VARCHAR(20) NOT NULL CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
    retirement_goal DECIMAL(12,2),
    tfsa_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    rrsp_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    fhsa_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    contribution_priority VARCHAR(50) CHECK (contribution_priority IN ('tfsa_first', 'balanced', 'rrsp_heavy')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);

CREATE OR REPLACE TRIGGER plans_set_updated_at
BEFORE UPDATE ON plans
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
