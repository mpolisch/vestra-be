import { pool } from '../db.js';
import type { ChatMessage } from '../types/index.js';
import type { ChatMessageDTO } from '../utils/schemas.js';
import { getPlanById } from './plans.js';
import { getProjection } from './projection.js';
import { Anthropic } from '@anthropic-ai/sdk/client.js';

export const getMessages = async (planId: string, userId: string): Promise<ChatMessage[]> => {
    await getPlanById(planId, userId);

    const result = await pool.query<ChatMessage>(
        'SELECT * FROM chat_messages WHERE plan_id = $1 ORDER BY created_at ASC LIMIT 50',
        [planId],
    );
    return result.rows;
};

export const sendMessage = async (
    planId: string,
    userId: string,
    data: ChatMessageDTO,
): Promise<ChatMessage> => {
    const plan = await getPlanById(planId, userId);
    const projection = await getProjection(planId, userId);
    const projectionSummary = projection.summary;

    const historyResult = await pool.query<ChatMessage>(
        'SELECT role, content FROM chat_messages WHERE plan_id = $1 ORDER BY created_at DESC LIMIT 10',
        [planId],
    );

    const history = historyResult.rows.reverse();

    const systemPrompt = `You are a helpful Canadian retirement planning assistant for Vestra.

        The user's retirement plan:
        - Current age: ${plan.current_age}, Retirement age: ${plan.retirement_age}
        - Annual income (after tax): $${plan.annual_income}
        - Monthly contributions: $${plan.monthly_contributions}
        - Risk tolerance: ${plan.risk_tolerance} (${plan.risk_tolerance === 'conservative' ? '4%' : plan.risk_tolerance === 'moderate' ? '6%' : '8%'} annual return)
        - Contribution priority: ${plan.contribution_priority}
        - TFSA: $${plan.tfsa_balance}, RRSP: $${plan.rrsp_balance}, FHSA: $${plan.fhsa_balance}
        ${plan.retirement_goal ? `- Retirement goal: $${plan.retirement_goal}` : '- No retirement goal set'}

        Projection results:
        - Projected balance at retirement: $${projectionSummary.projected_balance_at_retirement.toLocaleString()}
        - Years until retirement: ${projectionSummary.years_until_retirement}
        ${projectionSummary.will_meet_goal !== null ? `- Goal status: ${projectionSummary.will_meet_goal ? 'On track' : 'Off track'}` : ''}
        ${projectionSummary.shortfall ? `- Shortfall: $${projectionSummary.shortfall.toLocaleString()}` : ''}

        Tool limitations to be aware of:
        - Projections use simplified growth rates (conservative 4%, moderate 6%, aggressive 8%)
        - Contribution allocation is simplified — CRA annual limits not enforced
        - FHSA receives no new contributions in the current model
        - Post-retirement drawdown is not modeled
        - Unregistered savings grow at 2% (savings account rate)

        Answer questions about their specific numbers in plain English. Be honest about the tool's limitations when relevant. Be concise.`;

    const messages = [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: data.message },
    ];

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
    });

    const firstBlock = response.content[0];

    const assistantContent =
        firstBlock?.type === 'text' ? firstBlock.text : 'Sorry, I could not generate a response.';

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            'INSERT INTO chat_messages (plan_id, role, content) VALUES ($1, $2, $3)',
            [planId, 'user', data.message],
        );

        const result = await client.query<ChatMessage>(
            'INSERT INTO chat_messages (plan_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [planId, 'assistant', assistantContent],
        );

        await client.query('COMMIT');

        return result.rows[0]!;
    } catch (err: unknown) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
