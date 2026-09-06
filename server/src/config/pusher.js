import Pusher from 'pusher';
import { getSettingsService } from '../services/settingsService.js';
import { ExternalServiceError } from '../utils/appError.js';
import { wrapExternal } from '../utils/wrapExternal.js';

let pusher;

export function resetPusherClient() {
  pusher = null;
}

function readPusherConfig() {
  const settings = getSettingsService();
  return {
    appId: settings.get('PUSHER_APP_ID') || '',
    key: settings.get('PUSHER_KEY') || '',
    secret: settings.get('PUSHER_SECRET') || '',
    cluster: settings.get('PUSHER_CLUSTER') || '',
  };
}

export function isPusherConfigured() {
  const cfg = readPusherConfig();
  return Boolean(cfg.appId && cfg.key && cfg.secret && cfg.cluster);
}

export function getPusher() {
  if (!isPusherConfigured()) {
    throw new ExternalServiceError('Realtime service is not configured.', {
      statusCode: 503,
      service: 'pusher',
    });
  }

  if (!pusher) {
    const cfg = readPusherConfig();
    pusher = new Pusher({
      appId: cfg.appId,
      key: cfg.key,
      secret: cfg.secret,
      cluster: cfg.cluster,
      useTLS: true,
    });
  }

  return pusher;
}

export async function triggerPusherEvent(channel, event, payload) {
  if (!isPusherConfigured()) {
    return false;
  }

  return wrapExternal('pusher', async () => {
    await getPusher().trigger(channel, event, payload);
    return true;
  });
}
