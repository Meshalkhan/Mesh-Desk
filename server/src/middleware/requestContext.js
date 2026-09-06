import {
  createRequestContext,
  getRequestId,
  runWithRequestContext,
} from '../config/requestContext.js';

export function requestContextMiddleware(req, res, next) {
  const incoming = req.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && incoming.trim().length > 0
      ? incoming.trim().slice(0, 128)
      : createRequestContext().requestId;

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  runWithRequestContext({ requestId }, () => next());
}

export { getRequestId };
