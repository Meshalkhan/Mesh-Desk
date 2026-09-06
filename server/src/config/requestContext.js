import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const storage = new AsyncLocalStorage();

export function runWithRequestContext(context, fn) {
  return storage.run(context, fn);
}

export function getRequestContext() {
  return storage.getStore() ?? null;
}

export function getRequestId() {
  return getRequestContext()?.requestId ?? null;
}

export function createRequestContext(requestId = randomUUID()) {
  return { requestId };
}
