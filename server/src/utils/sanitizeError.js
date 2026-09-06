export function sanitizeErrorMessage(message) {
  if (!message || typeof message !== 'string') {
    return 'Internal server error';
  }

  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, 'sk-[REDACTED]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/mongodb(\+srv)?:\/\/[^\s'"]+/gi, 'mongodb://[REDACTED]');
}
