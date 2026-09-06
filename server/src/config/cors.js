import { getSettingsService } from '../services/settingsService.js';

export function allowedOrigins() {
  let raw = 'http://localhost:5173';
  try {
    raw = getSettingsService().get('CLIENT_URL') || raw;
  } catch {
    // Settings not initialized yet (e.g. during tests)
  }

  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (process.env.VERCEL_URL) {
    list.push(`https://${process.env.VERCEL_URL}`);
  }

  return [...new Set(list)];
}
