import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../../.env') });
dotenv.config({ path: join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { loadEnv } from '../config/env.js';
import { DEPRECATED_ENV_KEYS } from '../config/integrationKeys.js';
import { createSettingsService } from '../services/settingsService.js';
import { IntegrationSetting } from '../models/IntegrationSetting.js';

const LEGACY_DEFAULTS = {
  OPENAI_MODEL: 'gpt-4o-mini',
  CLIENT_URL: 'http://localhost:5173',
};

async function migrate() {
  const env = loadEnv();

  if (!env.databaseUrl) {
    console.error('DATABASE_URL (or legacy MONGODB_URI) is required.');
    process.exit(1);
  }
  if (!env.encryptionKey) {
    console.error('ENCRYPTION_KEY is required before migrating integration settings.');
    process.exit(1);
  }

  await connectDB(env.databaseUrl);
  const settingsService = createSettingsService(env.encryptionKey);
  await settingsService.init();

  let migrated = 0;
  let skipped = 0;

  for (const key of DEPRECATED_ENV_KEYS) {
    if (key === 'MONGODB_URI') {
      continue;
    }

    const legacyValue = process.env[key]?.trim();
    const fallbackValue = LEGACY_DEFAULTS[key];
    const value = legacyValue || fallbackValue;

    if (!value) {
      continue;
    }

    const existing = await IntegrationSetting.findOne({ key }).lean();
    if (existing) {
      skipped += 1;
      console.log(`[migrate] Skipped ${key} (already stored)`);
      continue;
    }

    await settingsService.set(key, value);
    migrated += 1;
    console.log(`[migrate] Stored ${key} from legacy environment`);
  }

  console.log(`[migrate] Done. Migrated ${migrated}, skipped ${skipped}.`);
  console.log(
    '[migrate] Deprecated .env keys can now be removed. Keep only DATABASE_URL and ENCRYPTION_KEY.'
  );

  process.exit(0);
}

migrate().catch((err) => {
  console.error('[migrate] Failed:', err.message || 'Unknown error');
  process.exit(1);
});
