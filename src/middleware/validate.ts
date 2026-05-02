import type { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema: ZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // .parse returns the data or throws an error
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Flatten Zod errors into a readable string or array
                const message = error.issues.map((e) => e.message).join(', ');
                return next(new AppError(message, 400));
            }
            next(error);
        }
    };
};
