import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../utils/appError.js';

/**
 * NOTE: Uses the default in-memory store (express-rate-limit MemoryStore).
 * Limits are per-process and do not sync across instances or survive restarts.
 * For horizontal scaling, replace with a Redis-backed store (e.g. rate-limit-redis).
 */
function createLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new RateLimitError(message));
    },
  });
}

/** Broad protection for all API traffic. */
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests. Please slow down.',
});

/** Stricter limit on credential endpoints (brute-force protection). */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again later.',
});

/** Stricter limit on AI chat completions (cost / abuse protection). */
export const aiMessageLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many AI requests. Please wait before sending more messages.',
});
