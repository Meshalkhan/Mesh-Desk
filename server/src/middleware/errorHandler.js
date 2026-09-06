import { AppError } from '../utils/appError.js';
import { normalizeError } from '../utils/normalizeError.js';
import { isProduction } from '../config/env.js';
import { getLogger } from '../config/logger.js';

export function errorHandler(err, req, res, _next) {
  if (res.headersSent) {
    return;
  }

  const appError = normalizeError(err);
  const statusCode = appError.statusCode || 500;
  const log = getLogger();

  if (statusCode >= 500) {
    log.error(
      {
        code: appError.errorCode,
        path: req.path,
        method: req.method,
        requestId: req.requestId,
        stack: err?.stack,
        cause: appError.cause?.message,
      },
      appError.message,
    );
  } else {
    log.warn(
      {
        code: appError.errorCode,
        path: req.path,
        method: req.method,
        requestId: req.requestId,
      },
      appError.message,
    );
  }

  const payload = appError.toJSON();
  if (isProduction() && statusCode >= 500) {
    payload.message = 'Internal server error';
  }

  res.status(statusCode).json({ error: payload });
}
