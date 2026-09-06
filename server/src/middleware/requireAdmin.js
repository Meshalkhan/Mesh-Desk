import { AuthError } from '../utils/appError.js';

export function requireAdmin(req, _res, next) {
  if (!req.user?.isAdmin) {
    return next(
      new AuthError('Admin access required.', {
        statusCode: 403,
        errorCode: 'AUTH_FORBIDDEN',
      }),
    );
  }
  return next();
}
