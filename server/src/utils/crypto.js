import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY_SALT = 'meshdesk-integration-settings-v1';

export function deriveEncryptionKey(encryptionKey) {
  if (!encryptionKey) {
    throw new Error('Encryption key is required.');
  }
  return scryptSync(encryptionKey, KEY_SALT, 32);
}

export function encryptValue(plaintext, encryptionKey) {
  const key = deriveEncryptionKey(encryptionKey);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  });
}

export function decryptValue(encryptedPayload, encryptionKey) {
  const { iv, tag, data } = JSON.parse(encryptedPayload);
  const key = deriveEncryptionKey(encryptionKey);
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
