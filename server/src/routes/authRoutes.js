import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { signupBodySchema, loginBodySchema } from 'meshdesk-shared';
import * as authController from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(authLimiter);
router.post('/signup', validate({ body: signupBodySchema }), asyncHandler(authController.signup));
router.post('/login', validate({ body: loginBodySchema }), asyncHandler(authController.login));

export default router;
