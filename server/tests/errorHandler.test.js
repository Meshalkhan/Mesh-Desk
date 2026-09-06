import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { errorHandler } from '../src/middleware/errorHandler.js';
import {
  AppError,
  AuthError,
  ValidationError,
  RateLimitError,
} from '../src/utils/appError.js';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.requestId = 'test-req-id';
    next();
  });

  app.get('/app-error', (_req, _res, next) => {
    next(new AppError({ statusCode: 418, errorCode: 'TEAPOT', message: 'I am a teapot.' }));
  });
  app.get('/auth-error', (_req, _res, next) => {
    next(new AuthError('Authentication required.'));
  });
  app.get('/validation-error', (_req, _res, next) => {
    next(new ValidationError([{ field: 'email', message: 'Invalid email.' }]));
  });
  app.get('/rate-limit', (_req, _res, next) => {
    next(new RateLimitError());
  });
  app.get('/unknown', (_req, _res, next) => {
    next(new Error('Unexpected failure'));
  });

  app.use(errorHandler);
  return app;
}

describe('errorHandler middleware', () => {
  it('returns structured AppError payload', async () => {
    const res = await request(buildApp()).get('/app-error');
    assert.equal(res.status, 418);
    assert.deepEqual(res.body.error, { code: 'TEAPOT', message: 'I am a teapot.' });
  });

  it('returns auth error shape', async () => {
    const res = await request(buildApp()).get('/auth-error');
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'AUTH_REQUIRED');
  });

  it('includes validation fields in response', async () => {
    const res = await request(buildApp()).get('/validation-error');
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_FAILED');
    assert.deepEqual(res.body.error.fields, [{ field: 'email', message: 'Invalid email.' }]);
  });

  it('returns 429 for rate limit errors', async () => {
    const res = await request(buildApp()).get('/rate-limit');
    assert.equal(res.status, 429);
    assert.equal(res.body.error.code, 'RATE_LIMITED');
  });

  it('masks 500 messages in production', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const res = await request(buildApp()).get('/unknown');
      assert.equal(res.status, 500);
      assert.equal(res.body.error.code, 'INTERNAL_ERROR');
      assert.equal(res.body.error.message, 'Internal server error');
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it('exposes raw 500 message in development', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      const res = await request(buildApp()).get('/unknown');
      assert.equal(res.status, 500);
      assert.equal(res.body.error.message, 'Unexpected failure');
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
