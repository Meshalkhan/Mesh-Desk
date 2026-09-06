import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getSettingsService } from './settingsService.js';
import { AuthError, ConflictError } from '../utils/appError.js';

function signToken(user) {
  const jwtSecret = getSettingsService().getRequired('JWT_SECRET');
  return jwt.sign(
    { sub: user._id.toString(), tv: user.tokenVersion || 0 },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

function toPublicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role || (user.isAdmin ? 'admin' : 'user'),
    isAdmin: Boolean(user.isAdmin || user.role === 'admin'),
  };
}

export async function signupUser({ username, email, password }) {
  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }],
  }).lean();
  if (existing) {
    throw new ConflictError('Email or username is already in use.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userCount = await User.countDocuments();
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash,
    role: userCount === 0 ? 'admin' : 'user',
    isAdmin: userCount === 0,
  });

  return {
    token: signToken(user),
    user: toPublicUser(user),
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AuthError('Invalid credentials.', { errorCode: 'AUTH_INVALID' });
  }

  if (user.isActive === false) {
    throw new AuthError('Account is suspended.', {
      statusCode: 403,
      errorCode: 'AUTH_FORBIDDEN',
    });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AuthError('Invalid credentials.', { errorCode: 'AUTH_INVALID' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    token: signToken(user),
    user: toPublicUser(user),
  };
}
