import { ZodError } from 'zod';
import { ValidationError } from '../utils/appError.js';

export { ValidationError };

export function formatZodErrors(error) {
  return error.errors.map((issue) => ({
    field: issue.path.length ? issue.path.join('.') : '_root',
    message: issue.message,
  }));
}

/**
 * @param {{ body?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny }} schemas
 */
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params ?? {});
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query ?? {});
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body ?? {});
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new ValidationError(formatZodErrors(err)));
      }
      next(err);
    }
  };
}
