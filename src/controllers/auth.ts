import type { Request, Response } from 'express';
import * as authService from '../services/auth.js';
import { sendSuccess } from '../utils/response.js';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

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

export const login = async (req: Request, res: Response) => {
    const { user, token } = await authService.loginUser(req.body);

    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    });

    return sendSuccess(res, user);
};

export const logout = (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    return sendSuccess(res, { message: 'Logged out successfully' });
};

export const me = (req: Request, res: Response) => {
    return sendSuccess(res, req.user!);
};
