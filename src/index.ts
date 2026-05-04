import 'dotenv/config';

// DATABASE_URL is validated inside db.ts before the pool is created.
// Validate the remaining vars here before any other imports run.
const REQUIRED_VARS = ['JWT_SECRET', 'CORS_ORIGIN'] as const;
for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) throw new Error(`Missing required env var: ${varName}`);
}

import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import type { Request, Response } from 'express';
import { authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }),
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || '4000', 10);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
