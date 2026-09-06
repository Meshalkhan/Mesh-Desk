import { IntegrationSetting } from '../models/IntegrationSetting.js';
import { encryptValue, decryptValue } from '../utils/crypto.js';
import {
  isKnownIntegrationKey,
  maskIntegrationValue,
  validateIntegrationValue,
} from '../config/integrationKeys.js';
import { AppError, BadRequestError } from '../utils/appError.js';
import { resetPusherClient } from '../config/pusher.js';

export class SettingsService {
  constructor(encryptionKey) {
    this.encryptionKey = encryptionKey;
    /** @type {Map<string, string>} */
    this.cache = new Map();
  }

  async init() {
    await this.refresh();
  }

  async refresh() {
    const docs = await IntegrationSetting.find().lean();
    const next = new Map();

    for (const doc of docs) {
      try {
        const value = decryptValue(doc.encryptedValue, this.encryptionKey);
        next.set(doc.key, value);
      } catch {
        console.error(`[settings] Failed to decrypt setting key: ${doc.key}`);
      }
    }

    this.cache = next;
    resetPusherClient();
  }

  get(key) {
    return this.cache.get(key) ?? null;
  }

  getRequired(key) {
    const value = this.get(key);
    if (!value) {
      throw new AppError({
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
        message: 'Integration setting is not configured.',
      });
    }
    return value;
  }

  async set(key, value, updatedBy = null) {
    if (!isKnownIntegrationKey(key)) {
      throw new BadRequestError('Unknown integration setting key.');
    }

    const validated = validateIntegrationValue(key, value);
    const encryptedValue = encryptValue(validated, this.encryptionKey);

    await IntegrationSetting.findOneAndUpdate(
      { key },
      { key, encryptedValue, updatedBy },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    this.cache.set(key, validated);
    resetPusherClient();
    return validated;
  }

  async list() {
    const docs = await IntegrationSetting.find()
      .populate('updatedBy', '_id username email')
      .sort({ key: 1 })
      .lean();

    return docs.map((doc) => {
      let plain = this.cache.get(doc.key) ?? null;
      if (!plain) {
        try {
          plain = decryptValue(doc.encryptedValue, this.encryptionKey);
        } catch {
          plain = '';
        }
      }

      return {
        id: doc._id,
        key: doc.key,
        maskedValue: maskIntegrationValue(plain),
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
      };
    });
  }
}

let settingsService;

export function createSettingsService(encryptionKey) {
  settingsService = new SettingsService(encryptionKey);
  return settingsService;
}

export function getSettingsService() {
  if (!settingsService) {
    throw new AppError({
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      message: 'Settings service has not been initialized.',
    });
  }
  return settingsService;
}
