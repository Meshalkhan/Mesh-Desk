export class AppError extends Error {
  constructor({
    statusCode = 500,
    errorCode = 'INTERNAL_ERROR',
    message = 'Internal server error',
    fields = null,
    cause = null,
  } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.fields = fields;
    if (cause) {
      this.cause = cause;
    }
  }

  toJSON() {
    const payload = {
      code: this.errorCode,
      message: this.message,
    };
    if (this.fields?.length) {
      payload.fields = this.fields;
    }
    return payload;
  }
}

export class ValidationError extends AppError {
  constructor(fields, message = 'Validation failed.') {
    super({
      statusCode: 400,
      errorCode: 'VALIDATION_FAILED',
      message,
      fields,
    });
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message, { statusCode = 401, errorCode = 'AUTH_REQUIRED' } = {}) {
    super({ statusCode, errorCode, message });
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super({ statusCode: 404, errorCode: 'NOT_FOUND', message });
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends AppError {
  constructor(message) {
    super({ statusCode: 400, errorCode: 'BAD_REQUEST', message });
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict.') {
    super({ statusCode: 409, errorCode: 'CONFLICT', message });
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super({ statusCode: 429, errorCode: 'RATE_LIMITED', message });
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message, { statusCode = 502, cause = null, service = null } = {}) {
    super({
      statusCode,
      errorCode: 'EXTERNAL_SERVICE',
      message,
      cause,
    });
    this.name = 'ExternalServiceError';
    this.service = service;
  }

  static fromCause(service, cause) {
    const messages = {
      llm: 'Language model request failed.',
      pusher: 'Realtime service unavailable.',
      database: 'Database is temporarily unavailable.',
    };
    const statusCodes = {
      llm: 502,
      pusher: 502,
      database: 503,
    };
    return new ExternalServiceError(messages[service] || 'External service unavailable.', {
      statusCode: statusCodes[service] || 502,
      cause,
      service,
    });
  }
}

export function isAppError(err) {
  return err instanceof AppError;
}
