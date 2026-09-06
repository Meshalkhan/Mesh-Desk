import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getSettingsService } from '../services/settingsService.js';
import { AuthError } from '../utils/appError.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AuthError('Authentication required.', { errorCode: 'AUTH_REQUIRED' }));
  }

  let jwtSecret;
  try {
    jwtSecret = getSettingsService().getRequired('JWT_SECRET');
  } catch {
    return next(
      new AuthError('Server auth configuration is incomplete.', {
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
      }),
    );
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.sub)
      .select('_id username email role isAdmin isActive tokenVersion')
      .lean();
    if (!user) {
      return next(new AuthError('Invalid authentication token.', { errorCode: 'AUTH_INVALID' }));
    }

    if (user.isActive === false) {
      return next(
        new AuthError('Account is suspended.', {
          statusCode: 403,
          errorCode: 'AUTH_FORBIDDEN',
        }),
      );
    }

    if ((payload.tv ?? 0) !== (user.tokenVersion ?? 0)) {
      return next(
        new AuthError('Session expired. Please sign in again.', { errorCode: 'AUTH_INVALID' }),
      );
    }

    req.user = {
      ...user,
      isAdmin: Boolean(user.isAdmin || user.role === 'admin'),
    };
    return next();
  } catch (_error) {
    return next(new AuthError('Invalid authentication token.', { errorCode: 'AUTH_INVALID' }));
  }
}
