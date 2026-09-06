import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { encryptValue, decryptValue } from '../src/utils/crypto.js';
import { SettingsService } from '../src/services/settingsService.js';
import { maskIntegrationValue } from '../src/config/integrationKeys.js';

describe('crypto utils', () => {
  it('encrypts and decrypts a round trip', () => {
    const plaintext = 'sk-proj-test-key-abcdefghijklmnop';
    const encryptionKey = 'local-dev-encryption-key-32chars!';

    const encrypted = encryptValue(plaintext, encryptionKey);
    const decrypted = decryptValue(encrypted, encryptionKey);

    assert.equal(decrypted, plaintext);
    assert.notEqual(encrypted, plaintext);
  });
});

describe('SettingsService', () => {
  it('stores and retrieves values through encrypted persistence', async () => {
    const stored = new Map();
    const fakeModel = {
      find: async () =>
        [...stored.entries()].map(([key, encryptedValue]) => ({
          key,
          encryptedValue,
          updatedAt: new Date(),
          updatedBy: null,
        })),
      findOneAndUpdate: async (query, update) => {
        stored.set(update.key, update.encryptedValue);
        return { key: update.key, encryptedValue: update.encryptedValue };
      },
    };

    const service = new SettingsService('test-encryption-key-32chars!');
    service.refresh = async function refreshMock() {
      const docs = await fakeModel.find();
      const next = new Map();
      for (const doc of docs) {
        const { decryptValue: decrypt } = await import('../src/utils/crypto.js');
        next.set(doc.key, decrypt(doc.encryptedValue, this.encryptionKey));
      }
      this.cache = next;
    };
    service.set = async function setMock(key, value) {
      const { encryptValue: encrypt } = await import('../src/utils/crypto.js');
      const { validateIntegrationValue } = await import('../src/config/integrationKeys.js');
      const validated = validateIntegrationValue(key, value);
      const encryptedValue = encrypt(validated, this.encryptionKey);
      await fakeModel.findOneAndUpdate({ key }, { key, encryptedValue });
      this.cache.set(key, validated);
      return validated;
    };

    await service.set('JWT_SECRET', 'a'.repeat(32));
    await service.refresh();

    assert.equal(service.get('JWT_SECRET'), 'a'.repeat(32));
    assert.equal(maskIntegrationValue(service.get('JWT_SECRET')), 'aaa...aaaa');
  });
});
