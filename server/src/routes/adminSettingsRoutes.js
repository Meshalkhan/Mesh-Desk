import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  integrationSettingParamSchema,
  integrationSettingBodySchema,
} from 'meshdesk-shared';
import * as adminSettingsController from '../controllers/adminSettingsController.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', asyncHandler(adminSettingsController.listSettings));
router.post('/test-pusher', asyncHandler(adminSettingsController.testPusher));
router.put(
  '/:key',
  validate({ params: integrationSettingParamSchema, body: integrationSettingBodySchema }),
  asyncHandler(adminSettingsController.updateSetting),
);

export default router;
