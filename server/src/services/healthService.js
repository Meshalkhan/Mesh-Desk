import mongoose from 'mongoose';
import { loadEnv } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { isPusherConfigured, getPusher } from '../config/pusher.js';
import { getSettingsService } from '../services/settingsService.js';
import { getDefaultModel } from './aiModelService.js';
import { getProviderApiKeySetting } from '../config/providerKeys.js';
import { testModelConnection } from './llmService.js';
import { getLogger } from '../config/logger.js';

const LLM_PROBE_TIMEOUT_MS = 15_000;

function pusherMissingKeys() {
  const settings = getSettingsService();
  const missing = [];
  if (!settings.get('PUSHER_APP_ID')) missing.push('PUSHER_APP_ID');
  if (!settings.get('PUSHER_KEY')) missing.push('PUSHER_KEY');
  if (!settings.get('PUSHER_SECRET')) missing.push('PUSHER_SECRET');
  if (!settings.get('PUSHER_CLUSTER')) missing.push('PUSHER_CLUSTER');
  return missing;
}

async function checkDatabase() {
  const { databaseUrl } = loadEnv();
  if (!databaseUrl) {
    return {
      status: 'not_configured',
      message: 'DATABASE_URL is not set.',
    };
  }

  try {
    await connectDB(databaseUrl);
    if (mongoose.connection.readyState !== 1) {
      return { status: 'error', message: 'Database connection is not ready.' };
    }
    await mongoose.connection.db.admin().ping();
    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'error',
      message: 'Database ping failed.',
      error: error.message,
    };
  }
}

async function checkPusher() {
  if (!isPusherConfigured()) {
    return {
      status: 'degraded',
      message: 'Realtime not configured. Team chat works without live updates.',
      missing: pusherMissingKeys(),
    };
  }

  try {
    await getPusher().get({ path: '/channels' });
    return { status: 'ok', provider: 'pusher' };
  } catch (error) {
    return {
      status: 'error',
      provider: 'pusher',
      message: 'Pusher validation request failed.',
      error: error.message,
    };
  }
}

async function probeWithTimeout(promise, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('LLM probe timed out.')), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function checkLlm() {
  let model;
  try {
    model = await getDefaultModel();
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to load AI model configuration.',
      error: error.message,
    };
  }

  if (!model) {
    return {
      status: 'not_configured',
      message: 'No active AI models are configured.',
    };
  }

  const settingKey = getProviderApiKeySetting(model.provider);
  const apiKey = settingKey ? getSettingsService().get(settingKey) : null;
  if (!apiKey) {
    return {
      status: 'not_configured',
      provider: model.provider,
      model: model.displayName,
      message: `Provider API key (${settingKey}) is not configured.`,
    };
  }

  try {
    const result = await probeWithTimeout(testModelConnection(model), LLM_PROBE_TIMEOUT_MS);
    return {
      status: 'ok',
      provider: model.provider,
      model: model.displayName,
      latencyMs: result.latencyMs,
    };
  } catch (error) {
    return {
      status: 'error',
      provider: model.provider,
      model: model.displayName,
      message: 'AI provider probe failed.',
      error: error.message,
    };
  }
}

function overallStatus(checks) {
  const critical = [checks.database, checks.llm];
  if (critical.some((c) => c.status === 'error')) return 'unhealthy';
  if (critical.some((c) => c.status === 'not_configured')) return 'degraded';
  if (checks.pusher.status === 'error') return 'degraded';
  if (checks.pusher.status === 'degraded') return 'degraded';
  return 'ok';
}

function httpStatusForOverall(overall) {
  if (overall === 'unhealthy') return 503;
  if (overall === 'degraded') return 200;
  return 200;
}

/** Liveness — process is up; no dependency checks. */
export function getLivenessPayload() {
  return {
    ok: true,
    service: 'meshdesk-api',
    env: process.env.NODE_ENV || 'development',
  };
}

/** Pusher-only health (no LLM cost) — for legacy /api/health/realtime. */
export async function getRealtimeHealthPayload() {
  const pusher = await checkPusher();
  return pusher;
}

/** Readiness — per-dependency status for orchestrators and ops dashboards. */
export async function getReadinessPayload() {
  const log = getLogger();
  const [database, pusher, llm] = await Promise.all([
    checkDatabase(),
    checkPusher().catch((error) => ({
      status: 'error',
      message: 'Pusher check failed.',
      error: error.message,
    })),
    checkLlm().catch((error) => ({
      status: 'error',
      message: 'LLM check failed.',
      error: error.message,
    })),
  ]);

  const checks = { database, pusher, llm };
  const overall = overallStatus(checks);

  log.info({ overall, checks: { database: database.status, pusher: pusher.status, llm: llm.status } }, 'readiness check');

  return {
    ok: overall === 'ok',
    service: 'meshdesk-api',
    status: overall,
    checks,
    httpStatus: httpStatusForOverall(overall),
  };
}
