import { NotFoundError } from '../utils/appError.js';

export function notFound(_req, _res, next) {
  next(new NotFoundError('Route not found.'));
}
