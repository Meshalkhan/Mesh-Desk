import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  aiModelCreateBodySchema,
  aiModelUpdateBodySchema,
  aiModelIdParamSchema,
} from 'meshdesk-shared';
import * as adminAiModelController from '../controllers/adminAiModelController.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', asyncHandler(adminAiModelController.list));
router.post('/', validate({ body: aiModelCreateBodySchema }), asyncHandler(adminAiModelController.create));
router.put('/:id', validate({ params: aiModelIdParamSchema, body: aiModelUpdateBodySchema }), asyncHandler(adminAiModelController.update));
router.patch('/:id/deactivate', validate({ params: aiModelIdParamSchema }), asyncHandler(adminAiModelController.deactivate));
router.post('/:id/test', validate({ params: aiModelIdParamSchema }), asyncHandler(adminAiModelController.testModel));

export default router;
