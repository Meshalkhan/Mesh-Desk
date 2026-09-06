import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validate } from '../src/middleware/validate.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { ValidationError } from '../src/utils/appError.js';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post(
    '/test',
    validate({
      body: z.object({
        email: z.string().email('Enter a valid email address.'),
        password: z.string().min(8, 'Password must be at least 8 characters.'),
      }),
    }),
    (_req, res) => res.json({ ok: true }),
  );
  app.use(errorHandler);
  return app;
}

describe('validate middleware', () => {
  it('returns structured field errors on invalid body', async () => {
    const app = buildApp();
    const res = await request(app).post('/test').send({ email: 'bad', password: 'short' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_FAILED');
    assert.ok(Array.isArray(res.body.error.fields));
    assert.ok(res.body.error.fields.some((e) => e.field === 'email'));
    assert.ok(res.body.error.fields.some((e) => e.field === 'password'));
  });

  it('passes validated body through to handler', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/test')
      .send({ email: 'user@example.com', password: 'Password1!' });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true });
  });

  it('ValidationError exposes fields array', () => {
    const err = new ValidationError([{ field: 'email', message: 'Invalid email.' }]);
    assert.equal(err.statusCode, 400);
    assert.equal(err.errorCode, 'VALIDATION_FAILED');
    assert.equal(err.fields[0].field, 'email');
  });
});
