import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  chatIdParamSchema,
  createChatBodySchema,
  sendChatMessageBodySchema,
} from 'meshdesk-shared';
import {
  listChats,
  createChat,
  getChat,
  deleteChat,
  sendMessage,
} from '../controllers/chatController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { aiMessageLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(listChats));
router.post('/', validate({ body: createChatBodySchema }), asyncHandler(createChat));
router.get('/:id', validate({ params: chatIdParamSchema }), asyncHandler(getChat));
router.delete('/:id', validate({ params: chatIdParamSchema }), asyncHandler(deleteChat));
router.post(
  '/:id/messages',
  aiMessageLimiter,
  validate({ params: chatIdParamSchema, body: sendChatMessageBodySchema }),
  asyncHandler(sendMessage),
);

export default router;
