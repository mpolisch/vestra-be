import type { Request, Response } from 'express';
import * as authService from '../services/auth.js';
import { sendSuccess } from '../utils/response.js';

export const register = async (req: Request, res: Response) => {
    const newUser = await authService.registerUser(req.body);
    return sendSuccess(res, newUser, 201);
};
