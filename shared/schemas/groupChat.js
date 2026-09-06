import { z } from 'zod';
import { messageContentSchema, objectIdSchema } from './common.js';

export const groupChatIdParamSchema = z.object({
  chatId: objectIdSchema,
});

export const createGroupChatBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Conversation name is required.')
    .max(80, 'Conversation name must be at most 80 characters.'),
  participants: z
    .array(objectIdSchema)
    .min(1, 'Select at least one participant.'),
});

export const sendGroupMessageBodySchema = z.object({
  content: messageContentSchema,
});

export const groupTypingBodySchema = z.object({
  isTyping: z.boolean({ required_error: 'isTyping is required.' }),
});
