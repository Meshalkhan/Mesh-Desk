import mongoose from 'mongoose';
import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ExternalServiceError,
} from './appError.js';
import { isProduction } from '../config/env.js';

export function normalizeError(err) {
  if (err instanceof AppError) {
    return err;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return new ValidationError(
      Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    );
  }

  if (err instanceof mongoose.Error.CastError) {
    return new ValidationError([{ field: err.path || 'id', message: 'Invalid identifier.' }]);
  }

  if (err?.code === 11000) {
    return new ConflictError('Duplicate record.');
  }

  const isMongo =
    err?.name === 'MongoServerSelectionError' ||
    err?.name === 'MongoNetworkError' ||
    err?.name === 'MongoParseError';

  if (isMongo) {
    return ExternalServiceError.fromCause('database', err);
  }

  if (isProduction()) {
    return new AppError({
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      message: 'Internal server error',
      cause: err,
    });
  }

  return new AppError({
    statusCode: err?.status || err?.statusCode || 500,
    errorCode: 'INTERNAL_ERROR',
    message: err?.message || 'Internal server error',
    cause: err,
  });
}

export function clientMessage(err) {
  if (err instanceof AppError) {
    return err.message;
  }
  return isProduction() ? 'Internal server error' : err?.message || 'Internal server error';
}
