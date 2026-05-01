import express from 'express';
import type { Request, Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the backend server!');
});

const PORT: number = parseInt(process.env.PORT || '4000', 10);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
