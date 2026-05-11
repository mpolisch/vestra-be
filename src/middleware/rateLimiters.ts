import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { status: 'error', message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { status: 'error', message: 'Too many messages, please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});
