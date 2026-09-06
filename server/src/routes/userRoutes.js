import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as userController from '../controllers/userController.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(userController.list));

export default router;
