import { getLogger } from '../config/logger.js';

export function requestLogger(req, res, next) {
  const start = Date.now();
  const log = getLogger();

  log.info({ method: req.method, path: req.originalUrl || req.url }, 'request started');

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const meta = {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
    };

    if (res.statusCode >= 500) {
      log.error(meta, 'request failed');
    } else if (res.statusCode >= 400) {
      log.warn(meta, 'request completed with client error');
    } else {
      log.info(meta, 'request completed');
    }
  });

  next();
}
