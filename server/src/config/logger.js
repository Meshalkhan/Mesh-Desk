import pino from 'pino';
import { isProduction } from './env.js';
import { getRequestId } from './requestContext.js';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction() ? 'info' : 'debug'),
  ...(isProduction()
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss' },
        },
      }),
});

/** Returns a child logger bound to the current requestId (when inside request context). */
export function getLogger() {
  const requestId = getRequestId();
  return requestId ? logger.child({ requestId }) : logger;
}
