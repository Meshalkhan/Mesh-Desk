import {
  INTEGRATION_VALUE_SCHEMAS,
  validateIntegrationValue,
  PUSHER_CLUSTERS,
  pusherClusterSchema,
} from 'meshdesk-shared';

export {
  PUSHER_CLUSTERS,
  pusherClusterSchema,
  INTEGRATION_VALUE_SCHEMAS,
  validateIntegrationValue,
};

export const PUBLIC_INTEGRATION_KEYS = ['PUSHER_KEY', 'PUSHER_CLUSTER', 'CLIENT_URL'];

/** @deprecated Legacy .env variables migrated by scripts/migrate-env-to-settings.js */
export const DEPRECATED_ENV_KEYS = [
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'JWT_SECRET',
  'PUSHER_APP_ID',
  'PUSHER_KEY',
  'PUSHER_SECRET',
  'PUSHER_CLUSTER',
  'CLIENT_URL',
  'MONGODB_URI',
];

export function isKnownIntegrationKey(key) {
  return Object.hasOwn(INTEGRATION_VALUE_SCHEMAS, key);
}

export function maskIntegrationValue(value) {
  if (!value) {
    return '';
  }
  if (value.length <= 8) {
    return '****';
  }
  return `${value.slice(0, 3)}...${value.slice(-4)}`;
}
