import 'dotenv/config';
import './db.js';
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
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the backend server!');
});

app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || '4000', 10);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
