import { Router } from 'express';
import * as plansController from '../controllers/plans.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { createPlanSchema, updatePlanSchema } from '../utils/schemas.js';

const router = Router();

router.get('/', requireAuth, plansController.getPlansByUser);
router.post('/', requireAuth, validate(createPlanSchema), plansController.createPlan);
router.get('/:id', requireAuth, plansController.getPlanById);
router.put('/:id', requireAuth, validate(updatePlanSchema), plansController.updatePlan);
router.delete('/:id', requireAuth, plansController.deletePlan);

export { router as plansRouter };
