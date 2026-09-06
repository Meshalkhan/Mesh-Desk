import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../../.env') });
dotenv.config({ path: join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { loadEnv, isProduction } from '../config/env.js';
import { createSettingsService } from '../services/settingsService.js';
import { User } from '../models/User.js';

const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@meshdesk.local',
  password: 'Admin123!mesh',
};

function parseArgs(argv) {
  return {
    yes:
      argv.includes('--yes') ||
      argv.includes('-y') ||
      process.env.RESET_YES === '1' ||
      process.env.RESET_YES === 'true',
  };
}

function resolveAdminCredentials() {
  const username = process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN.username;
  const email = process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN.email;
  const password = process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN.password;
  return { username, email, password };
}

function resolveJwtSecret() {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return crypto.randomBytes(32).toString('hex');
}

async function resetDatabase() {
  const { yes } = parseArgs(process.argv.slice(2));
  if (!yes) {
    console.error('[reset] Refusing to run without --yes (this deletes ALL database data).');
    console.error('[reset] Usage: npm run reset:db -- --yes');
    process.exit(1);
  }

  if (isProduction() && process.env.RESET_CONFIRM !== 'DELETE_ALL_DATA') {
    console.error(
      '[reset] Production guard: set RESET_CONFIRM=DELETE_ALL_DATA in the environment to proceed.',
    );
    process.exit(1);
  }

  const env = loadEnv();
  if (!env.databaseUrl) {
    console.error('[reset] DATABASE_URL is required.');
    process.exit(1);
  }
  if (!env.encryptionKey) {
    console.error('[reset] ENCRYPTION_KEY is required.');
    process.exit(1);
  }

  const admin = resolveAdminCredentials();
  const jwtSecret = resolveJwtSecret();
  const jwtFromEnv = Boolean(process.env.JWT_SECRET?.trim());

  console.warn('[reset] This will DELETE ALL DATA in:', env.databaseUrl.replace(/\/\/([^@/]+@)?/, '//***@'));
  console.warn('[reset] Starting in 2 seconds… (Ctrl+C to abort)');

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await connectDB(env.databaseUrl);

  const { db } = mongoose.connection;
  const beforeCollections = (await db.listCollections().toArray()).map((c) => c.name);
  await db.dropDatabase();

  console.log('[reset] Dropped database. Removed collections:', beforeCollections.length ? beforeCollections.join(', ') : '(none)');

  const settingsService = createSettingsService(env.encryptionKey);
  await settingsService.set('JWT_SECRET', jwtSecret);
  console.log('[reset] Stored JWT_SECRET' + (jwtFromEnv ? ' (from JWT_SECRET env).' : ' (generated).'));

  const passwordHash = await bcrypt.hash(admin.password, 10);
  await User.create({
    username: admin.username,
    email: admin.email.toLowerCase(),
    passwordHash,
    role: 'admin',
    isAdmin: true,
    isActive: true,
    tokenVersion: 0,
  });

  console.log('[reset] Created admin user.');
  console.log('');
  console.log('  Sign in at http://localhost:5173');
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${admin.password}`);
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    console.log('  (default password — change after first login or set ADMIN_PASSWORD before reset)');
  }
  console.log('');
  console.log('[reset] Integration settings, AI models, chats, and users were wiped.');
  console.log('[reset] Configure Pusher, LLM keys, and models manually in Admin → Integrations.');

  await mongoose.disconnect();
  process.exit(0);
}

resetDatabase().catch((err) => {
  console.error('[reset] Failed:', err.message || 'Unknown error');
  process.exit(1);
});
