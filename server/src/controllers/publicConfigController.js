import { getSettingsService } from '../services/settingsService.js';
import { PUBLIC_INTEGRATION_KEYS } from '../config/integrationKeys.js';

export function getPublicConfig(_req, res) {
  const settings = getSettingsService();
  const config = {};

  for (const key of PUBLIC_INTEGRATION_KEYS) {
    const value = settings.get(key);
    if (value) {
      config[key] = value;
    }
  }

  res.json({
    pusherKey: config.PUSHER_KEY || null,
    pusherCluster: config.PUSHER_CLUSTER || null,
    clientUrl: config.CLIENT_URL || null,
  });
}
