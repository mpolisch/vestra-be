import { Router } from 'express';
import * as authController from '../controllers/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema } from '../utils/schemas.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);

export { router as authRouter };
