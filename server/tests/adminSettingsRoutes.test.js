import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { requireAdmin } from '../src/middleware/requireAdmin.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

function buildApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = user;
    next();
  });
  app.get('/api/admin/settings', requireAdmin, (_req, res) => {
    res.json([{ key: 'JWT_SECRET', maskedValue: 'aaa...aaaa' }]);
  });
  app.put('/api/admin/settings/:key', requireAdmin, (req, res) => {
    res.json({ key: req.params.key, ok: true });
  });
  app.use(errorHandler);
  return app;
}

describe('admin settings auth guard', () => {
  it('returns 403 for non-admin users on GET', async () => {
    const app = buildApp({ _id: '1', isAdmin: false });
    const res = await request(app).get('/api/admin/settings');
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'AUTH_FORBIDDEN');
    assert.equal(res.body.error.message, 'Admin access required.');
  });

  it('returns 403 for non-admin users on PUT', async () => {
    const app = buildApp({ _id: '1', isAdmin: false });
    const res = await request(app)
      .put('/api/admin/settings/JWT_SECRET')
      .send({ value: 'b'.repeat(32) });
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'AUTH_FORBIDDEN');
  });

  it('allows admin users', async () => {
    const app = buildApp({ _id: '1', isAdmin: true });
    const res = await request(app).get('/api/admin/settings');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });
});
