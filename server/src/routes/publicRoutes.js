import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getPublicConfig } from '../controllers/publicConfigController.js';

const router = Router();

router.get('/config', asyncHandler(getPublicConfig));

export default router;
