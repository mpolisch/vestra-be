import { Router } from 'express';
import * as plansController from '../controllers/plans.js';
import * as projectionController from '../controllers/projection.js';
import * as chatController from '../controllers/chat.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { createPlanSchema, updatePlanSchema, chatMessageSchema } from '../utils/schemas.js';

const router = Router();

router.get('/', requireAuth, plansController.getPlansByUser);
router.post('/', requireAuth, validate(createPlanSchema), plansController.createPlan);
router.get('/:id', requireAuth, plansController.getPlanById);
router.put('/:id', requireAuth, validate(updatePlanSchema), plansController.updatePlan);
router.delete('/:id', requireAuth, plansController.deletePlan);
router.get('/:id/projection', requireAuth, projectionController.getProjection);
router.get('/:id/chat', requireAuth, chatController.getMessages);
router.post('/:id/chat', requireAuth, validate(chatMessageSchema), chatController.sendMessage);

export { router as plansRouter };
