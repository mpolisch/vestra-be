import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import type { AuthPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token as string | undefined;

    if (!token) {
        return next(new AppError('Authentication required. Please log in.', 401));
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = { userId: payload.userId, email: payload.email };
        next();
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'TokenExpiredError') {
            return next(new AppError('Your session has expired. Please log in again.', 401));
        }
        next(new AppError('Invalid or tampered session. Please log in again.', 401));
    }
};
