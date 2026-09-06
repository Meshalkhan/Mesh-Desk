import crypto from 'crypto';
import { getSettingsService } from './settingsService.js';

export async function sendPasswordResetEmail({ email, username, resetToken }) {
  const settings = getSettingsService();
  const clientUrl = settings.get('CLIENT_URL') || 'http://localhost:5173';
  const resetUrl = `${clientUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  // Password reset delivery is logged server-side only; wire SMTP via settings later.
  console.info('[email] Password reset requested', {
    to: email,
    username,
    resetUrl: resetUrl.replace(resetToken, '[TOKEN]'),
  });

  return { delivered: true, mode: 'logged' };
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
