import { z } from 'zod';
import { emailSchema, loginPasswordSchema, passwordSchema, usernameSchema } from './common.js';

export const signupBodySchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});
