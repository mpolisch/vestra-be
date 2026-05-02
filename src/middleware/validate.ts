import type { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema: ZodType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.issues.map((e) => e.message).join(', ');
                return next(new AppError(message, 400));
            }
            next(error);
        }
    };
};
