import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  groupChatIdParamSchema,
  createGroupChatBodySchema,
  sendGroupMessageBodySchema,
  groupTypingBodySchema,
} from 'meshdesk-shared';
import * as groupChatController from '../controllers/groupChatController.js';

const router = Router();

router.use(requireAuth);

router.get('/presence/online', asyncHandler(groupChatController.presenceOnlineList));
router.post('/presence/online', asyncHandler(groupChatController.presenceOnline));
router.post('/presence/offline', asyncHandler(groupChatController.presenceOffline));

router.get('/', asyncHandler(groupChatController.listGroupChats));
router.post('/', validate({ body: createGroupChatBodySchema }), asyncHandler(groupChatController.createGroupChat));
router.delete('/:chatId', validate({ params: groupChatIdParamSchema }), asyncHandler(groupChatController.deleteGroupChat));
router.get('/:chatId/messages', validate({ params: groupChatIdParamSchema }), asyncHandler(groupChatController.listGroupMessages));
router.post(
  '/:chatId/messages',
  validate({ params: groupChatIdParamSchema, body: sendGroupMessageBodySchema }),
  asyncHandler(groupChatController.createGroupMessage),
);
router.post(
  '/:chatId/typing',
  validate({ params: groupChatIdParamSchema, body: groupTypingBodySchema }),
  asyncHandler(groupChatController.updateGroupTyping),
);

export default router;
