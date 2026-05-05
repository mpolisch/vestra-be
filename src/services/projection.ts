import type {
    Plan,
    ProjectionDataPoint,
    ProjectionResponse,
    ProjectionSummary,
} from '../types/index.js';
import { getPlanById } from './plans.js';

const GROWTH_RATES: Record<Plan['risk_tolerance'], number> = {
    conservative: 0.04,
    moderate: 0.06,
    aggressive: 0.08,
};

const UNREGISTERED_GROWTH_RATE = 0.02;

const ALLOCATION: Record<
    Plan['contribution_priority'],
    { tfsa: number; rrsp: number; fhsa: number }
> = {
    tfsa_first: { tfsa: 1.0, rrsp: 0.0, fhsa: 0.0 },
    balanced: { tfsa: 0.5, rrsp: 0.3, fhsa: 0.2 },
    rrsp_heavy: { tfsa: 0.3, rrsp: 0.7, fhsa: 0.0 },
};

export const getProjection = async (
    planId: string,
    userId: string,
): Promise<ProjectionResponse> => {
    const plan = await getPlanById(planId, userId);

    // Parse pg NUMERIC strings to numbers
    const currentSavings = parseFloat(plan.current_savings);
    const monthlyContributions = parseFloat(plan.monthly_contributions);
    const tfsaBalance = parseFloat(plan.tfsa_balance);
    const rrspBalance = parseFloat(plan.rrsp_balance);
    const fhsaBalance = parseFloat(plan.fhsa_balance);
    const unregisteredBalance = Math.max(
        0,
        currentSavings - (tfsaBalance + rrspBalance + fhsaBalance),
    );
    const yearlyContribution = monthlyContributions * 12;

    // Determine growth rate
    const growthRate = GROWTH_RATES[plan.risk_tolerance];

    // Determine contribution allocation
    const allocation = ALLOCATION[plan.contribution_priority];

    // Loop year by year
    // Contributions are added before growth (beginning-of-year assumption)
    // FHSA allocation is 0 for tfsa_first and rrsp_heavy, since FHSA complexity is out of scope
    // Unregistered balance grows 2% and never receives new contributions
    const dataPoints: ProjectionDataPoint[] = [];
    const currentYear = new Date().getFullYear();

    let tfsa = tfsaBalance;
    let rrsp = rrspBalance;
    let fhsa = fhsaBalance;
    let unregistered = unregisteredBalance;

    for (let age = plan.current_age; age <= plan.retirement_age; age++) {
        tfsa += yearlyContribution * allocation.tfsa;
        rrsp += yearlyContribution * allocation.rrsp;
        fhsa += yearlyContribution * allocation.fhsa;

        tfsa *= 1 + growthRate;
        rrsp *= 1 + growthRate;
        fhsa *= 1 + growthRate;
        unregistered *= 1 + UNREGISTERED_GROWTH_RATE;

        const total = tfsa + rrsp + fhsa + unregistered;

        dataPoints.push({
            age,
            year: currentYear + (age - plan.current_age),
            total_balance: Math.round(total),
            tfsa_balance: Math.round(tfsa),
            rrsp_balance: Math.round(rrsp),
            fhsa_balance: Math.round(fhsa),
            unregistered_balance: Math.round(unregistered),
            yearly_contribution: yearlyContribution,
        });
    }

    // Step 5: Build summary
    const finalBalance = dataPoints[dataPoints.length - 1]!.total_balance;
    const retirementGoal = plan.retirement_goal !== null ? parseFloat(plan.retirement_goal) : null;

    const summary: ProjectionSummary = {
        projected_balance_at_retirement: finalBalance,
        years_until_retirement: plan.retirement_age - plan.current_age,
        will_meet_goal: retirementGoal !== null ? finalBalance >= retirementGoal : null,
        shortfall:
            retirementGoal !== null && finalBalance < retirementGoal
                ? Math.round(retirementGoal - finalBalance)
                : null,
    };

    return { data_points: dataPoints, summary };
};
