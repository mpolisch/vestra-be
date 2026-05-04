import type { Request, Response } from 'express';
import * as plansService from '../services/plans.js';
import { sendSuccess } from '../utils/response.js';

export const getPlansByUser = async (req: Request, res: Response) => {
    const plans = await plansService.getPlansByUser(req.user!.userId);
    //Always return 200
    return sendSuccess(res, plans);
};

export const createPlan = async (req: Request, res: Response) => {
    const plan = await plansService.createPlan(req.user!.userId, req.body);

    return sendSuccess(res, plan, 201);
};

export const getPlanById = async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const plan = await plansService.getPlanById(id, req.user!.userId);

    return sendSuccess(res, plan);
};

export const updatePlan = async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const plan = await plansService.updatePlan(id, req.user!.userId, req.body);

    return sendSuccess(res, plan);
};

export const deletePlan = async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    await plansService.deletePlan(id, req.user!.userId);

    res.status(204).send();
};
