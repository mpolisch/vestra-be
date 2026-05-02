import type { Request, Response } from 'express';
import * as authService from '../services/auth.js';
import { sendSuccess } from '../utils/response.js';

export const register = async (req: Request, res: Response) => {
    await authService.registerUser(req.body);
    // Always return 201 regardless of whether the email was already taken.
    // This prevents email enumeration — the response is identical either way.
    return sendSuccess(
        res,
        { message: 'If this email is available, your account has been created.' },
        201,
    );
};
