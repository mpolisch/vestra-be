import type { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200): Response => {
    return res.status(statusCode).json({
        status: 'success',
        data,
    });
};
