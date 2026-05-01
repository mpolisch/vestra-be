import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

import './db.js';

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

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the backend server!');
});

app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || '4000', 10);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
