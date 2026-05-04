import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';

const errorHandler: ErrorRequestHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (res.headersSent) return next(err);

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const is5xx = statusCode >= 500;

    if (is5xx) {
        console.error('Server error', {
            statusCode,
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
        });
    } else {
        console.warn('Client error', {
            statusCode,
            message: err instanceof Error ? err.message : String(err),
        });
    }

    const message =
        err instanceof AppError
            ? err.message
            : 'An unexpected error occurred. Please try again later.';

    res.status(statusCode).json({ status: 'error', message });
};

export { errorHandler };
