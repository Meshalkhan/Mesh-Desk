import { ExternalServiceError } from './appError.js';
import { getLogger } from '../config/logger.js';

export async function wrapExternal(service, fn) {
  try {
    return await fn();
  } catch (cause) {
    if (cause instanceof ExternalServiceError) {
      throw cause;
    }
    getLogger().warn({ service, err: cause?.message }, 'external service call failed');
    throw ExternalServiceError.fromCause(service, cause);
  }
}

export function wrapExternalSync(service, fn) {
  try {
    return fn();
  } catch (cause) {
    if (cause instanceof ExternalServiceError) {
      throw cause;
    }
    throw ExternalServiceError.fromCause(service, cause);
  }
}
