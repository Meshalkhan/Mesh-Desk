import { connectDB } from './db.js';
import { loadEnv } from './env.js';
import { createSettingsService, getSettingsService } from '../services/settingsService.js';

let coreReady;

export async function bootstrapCore() {
  if (coreReady) {
    return coreReady;
  }

  coreReady = (async () => {
    const env = loadEnv();
    if (!env.databaseUrl) {
      throw new Error('DATABASE_URL is not configured.');
    }
    if (!env.encryptionKey) {
      throw new Error('ENCRYPTION_KEY is not configured.');
    }

    await connectDB(env.databaseUrl);

    try {
      getSettingsService();
    } catch {
      createSettingsService(env.encryptionKey);
    }

    await getSettingsService().init();
  })();

  return coreReady;
}

export async function settingsMiddleware(_req, _res, next) {
  try {
    await bootstrapCore();
    next();
  } catch (err) {
    next(err);
  }
}
