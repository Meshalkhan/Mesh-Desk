import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  adminUserListQuerySchema,
  userIdParamSchema,
  updateUserRoleBodySchema,
  updateUserStatusBodySchema,
  bulkUpdateUserStatusBodySchema,
} from 'meshdesk-shared';
import * as adminUserController from '../controllers/adminUserController.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', validate({ query: adminUserListQuerySchema }), asyncHandler(adminUserController.listUsers));
router.post('/bulk-status', validate({ body: bulkUpdateUserStatusBodySchema }), asyncHandler(adminUserController.bulkUpdateStatus));
router.get('/:id/stats', validate({ params: userIdParamSchema }), asyncHandler(adminUserController.getUserStats));
router.patch('/:id/role', validate({ params: userIdParamSchema, body: updateUserRoleBodySchema }), asyncHandler(adminUserController.updateRole));
router.patch('/:id/status', validate({ params: userIdParamSchema, body: updateUserStatusBodySchema }), asyncHandler(adminUserController.updateStatus));
router.post('/:id/force-password-reset', validate({ params: userIdParamSchema }), asyncHandler(adminUserController.forcePasswordReset));

export default router;
