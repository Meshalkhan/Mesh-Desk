import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../src/middleware/auth.js';
import { requireAdmin } from '../src/middleware/requireAdmin.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { createSettingsService } from '../src/services/settingsService.js';
import { User } from '../src/models/User.js';

const JWT_SECRET = 'a'.repeat(32);

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.get('/protected', requireAuth, (req, res) => {
    res.json({ userId: String(req.user._id) });
  });
  app.get('/admin', requireAuth, requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function stubFindById(user) {
  const original = User.findById;
  User.findById = () => ({
    select: () => ({
      lean: async () => user,
    }),
  });
  return () => {
    User.findById = original;
  };
}

describe('requireAuth middleware', () => {
  let restoreFindById;

  beforeEach(() => {
    createSettingsService('test-encryption-key-32chars!');
    const service = createSettingsService('test-encryption-key-32chars!');
    service.cache.set('JWT_SECRET', JWT_SECRET);
  });

  afterEach(() => {
    restoreFindById?.();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(buildAuthApp()).get('/protected');
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'AUTH_REQUIRED');
  });

  it('returns 401 for invalid JWT', async () => {
    const res = await request(buildAuthApp())
      .get('/protected')
      .set('Authorization', 'Bearer not-a-valid-token');
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'AUTH_INVALID');
  });

  it('returns 401 when user is not found', async () => {
    restoreFindById = stubFindById(null);
    const token = signToken({ sub: '507f1f77bcf86cd799439011', tv: 0 });
    const res = await request(buildAuthApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'AUTH_INVALID');
  });

  it('returns 403 when account is suspended', async () => {
    restoreFindById = stubFindById({
      _id: '507f1f77bcf86cd799439011',
      username: 'suspended',
      email: 's@example.com',
      role: 'user',
      isAdmin: false,
      isActive: false,
      tokenVersion: 0,
    });
    const token = signToken({ sub: '507f1f77bcf86cd799439011', tv: 0 });
    const res = await request(buildAuthApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'AUTH_FORBIDDEN');
    assert.match(res.body.error.message, /suspended/i);
  });

  it('returns 401 when token version does not match', async () => {
    restoreFindById = stubFindById({
      _id: '507f1f77bcf86cd799439011',
      username: 'alice',
      email: 'a@example.com',
      role: 'user',
      isAdmin: false,
      isActive: true,
      tokenVersion: 2,
    });
    const token = signToken({ sub: '507f1f77bcf86cd799439011', tv: 0 });
    const res = await request(buildAuthApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'AUTH_INVALID');
    assert.match(res.body.error.message, /session expired/i);
  });

  it('allows valid token and attaches user', async () => {
    restoreFindById = stubFindById({
      _id: '507f1f77bcf86cd799439011',
      username: 'alice',
      email: 'a@example.com',
      role: 'user',
      isAdmin: false,
      isActive: true,
      tokenVersion: 0,
    });
    const token = signToken({ sub: '507f1f77bcf86cd799439011', tv: 0 });
    const res = await request(buildAuthApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.userId, '507f1f77bcf86cd799439011');
  });

  it('treats role=admin as isAdmin for requireAdmin', async () => {
    restoreFindById = stubFindById({
      _id: '507f1f77bcf86cd799439011',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      isAdmin: false,
      isActive: true,
      tokenVersion: 0,
    });
    const token = signToken({ sub: '507f1f77bcf86cd799439011', tv: 0 });
    const res = await request(buildAuthApp())
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true });
  });
});
