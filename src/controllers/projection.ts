import type { Request, Response } from 'express';
import * as projectionService from '../services/projection.js';
import { sendSuccess } from '../utils/response.js';

export const getProjection = async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const projection = await projectionService.getProjection(id, req.user!.userId);

    return sendSuccess(res, projection);
};
