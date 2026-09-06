import { z } from 'zod';
import { messageContentSchema, objectIdSchema } from './common.js';

export const chatIdParamSchema = z.object({
  id: objectIdSchema,
});

export const createChatBodySchema = z.object({
  aiModelId: objectIdSchema.optional().nullable(),
});

export const sendChatMessageBodySchema = z.object({
  content: messageContentSchema,
  modelId: objectIdSchema.optional().nullable(),
});
