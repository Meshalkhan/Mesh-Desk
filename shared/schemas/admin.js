import { z } from 'zod';
import { objectIdSchema } from './common.js';

export const userIdParamSchema = z.object({
  id: objectIdSchema,
});

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional().default(''),
  sort: z
    .enum(['username', 'email', 'role', 'createdAt', 'lastLoginAt'])
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const updateUserRoleBodySchema = z.object({
  role: z.enum(['admin', 'user'], { required_error: 'Role is required.' }),
});

export const updateUserStatusBodySchema = z.object({
  isActive: z.boolean({ required_error: 'isActive is required.' }),
});

export const bulkUpdateUserStatusBodySchema = z.object({
  userIds: z.array(objectIdSchema).min(1, 'Select at least one user.'),
  isActive: z.boolean({ required_error: 'isActive is required.' }),
});
