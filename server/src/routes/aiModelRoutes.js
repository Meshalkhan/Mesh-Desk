import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as aiModelController from '../controllers/aiModelController.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(aiModelController.listActive));
router.get('/default', asyncHandler(aiModelController.getDefault));

export default router;
