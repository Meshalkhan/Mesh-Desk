import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../../.env') });
dotenv.config({ path: join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { loadEnv } from '../config/env.js';
import { createSettingsService } from '../services/settingsService.js';
import { AIModel } from '../models/AIModel.js';
import { getSettingsService } from '../services/settingsService.js';

async function seed() {
  const env = loadEnv();
  if (!env.databaseUrl || !env.encryptionKey) {
    console.error('DATABASE_URL and ENCRYPTION_KEY are required.');
    process.exit(1);
  }

  await connectDB(env.databaseUrl);
  createSettingsService(env.encryptionKey);
  await getSettingsService().init();

  const existing = await AIModel.countDocuments();
  if (existing > 0) {
    console.log('[seed:ai-models] Models already exist. Skipping.');
    process.exit(0);
  }

  const settings = getSettingsService();
  const modelName = settings.get('OPENAI_MODEL') || 'gpt-4o-mini';

  await AIModel.create({
    provider: 'openai',
    modelName,
    displayName: `OpenAI ${modelName}`,
    isActive: true,
    isDefault: true,
    config: {
      temperature: 0.6,
      maxTokens: 1024,
      systemPromptOverride: null,
    },
  });

  console.log(`[seed:ai-models] Created default OpenAI model (${modelName}).`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed:ai-models] Failed:', err.message || 'Unknown error');
  process.exit(1);
});
