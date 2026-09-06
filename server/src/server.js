import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../.env') });

import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { bootstrapCore } from './config/bootstrap.js';
import { getSettingsService } from './services/settingsService.js';
import { getLogger } from './config/logger.js';

async function main() {
  const log = getLogger();
  await bootstrapCore();

  if (!getSettingsService().get('JWT_SECRET')) {
    log.error('JWT_SECRET is not configured in integration settings. Run: npm run migrate:settings');
    process.exit(1);
  }

  const app = createApp();
  const { port } = loadEnv();
  app.listen(port, () => {
    log.info({ port }, 'API listening');
  });
}

main().catch((err) => {
  getLogger().error({ err: err.message }, 'Server startup failed');
  process.exit(1);
});
