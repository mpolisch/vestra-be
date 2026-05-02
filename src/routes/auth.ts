import { Router } from 'express';
import * as authController from '../controllers/auth.js';

const router = Router();

router.get('/register', authController.register);

export { router as authRouter };
