import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Chat } from '../models/Chat.js';
import { GroupChat } from '../models/GroupChat.js';
import { BadRequestError, NotFoundError } from '../utils/appError.js';
import { logAdminAction } from './auditService.js';
import {
  generateResetToken,
  hashResetToken,
  sendPasswordResetEmail,
} from './emailService.js';

const SORTABLE_FIELDS = new Set(['username', 'email', 'role', 'createdAt', 'lastLoginAt']);

function formatUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role || (user.isAdmin ? 'admin' : 'user'),
    isActive: user.isActive !== false,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export async function listUsers({
  page = 1,
  limit = 20,
  search = '',
  sort = 'createdAt',
  order = 'desc',
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const sortField = SORTABLE_FIELDS.has(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const filter = {};
  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    filter.$or = [
      { username: { $regex: trimmedSearch, $options: 'i' } },
      { email: { $regex: trimmedSearch, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('username email role isAdmin isActive lastLoginAt createdAt')
      .sort({ [sortField]: sortOrder })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    items: users.map(formatUser),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

export async function getUserStats(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new BadRequestError('Invalid user id.');
  }

  const user = await User.findById(userId).select('username email role isActive createdAt lastLoginAt').lean();
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const [aiConversationCount, groupConversationCount] = await Promise.all([
    Chat.countDocuments({ owner: userId }),
    GroupChat.countDocuments({ participants: userId }),
  ]);

  return {
    user: formatUser(user),
    stats: {
      aiConversationCount,
      groupConversationCount,
    },
  };
}

export async function updateUserRole(actorId, userId, role) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new BadRequestError('Invalid user id.');
  }
  if (!['admin', 'user'].includes(role)) {
    throw new BadRequestError('Invalid role.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }
  if (String(user._id) === String(actorId) && role !== 'admin') {
    throw new BadRequestError('You cannot remove your own admin role.');
  }

  user.role = role;
  user.isAdmin = role === 'admin';
  await user.save();

  await logAdminAction({
    actorId,
    targetUserId: userId,
    action: 'change_role',
    metadata: { role },
  });

  return formatUser(user.toObject());
}

export async function updateUserStatus(actorId, userId, isActive) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new BadRequestError('Invalid user id.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }
  if (String(user._id) === String(actorId) && !isActive) {
    throw new BadRequestError('You cannot suspend your own account.');
  }

  user.isActive = isActive;
  if (!isActive) {
    user.tokenVersion += 1;
  }
  await user.save();

  await logAdminAction({
    actorId,
    targetUserId: userId,
    action: isActive ? 'reactivate_user' : 'suspend_user',
  });

  return formatUser(user.toObject());
}

export async function bulkUpdateUserStatus(actorId, userIds, isActive) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError('User ids are required.');
  }

  const validIds = userIds.filter((id) => mongoose.isValidObjectId(id));
  if (validIds.length === 0) {
    throw new BadRequestError('No valid user ids provided.');
  }

  const filteredIds = validIds.filter((id) => String(id) !== String(actorId));
  const update = { isActive };
  if (!isActive) {
    await User.updateMany({ _id: { $in: filteredIds } }, { $inc: { tokenVersion: 1 } });
  }
  const result = await User.updateMany({ _id: { $in: filteredIds } }, { $set: update });

  await logAdminAction({
    actorId,
    action: isActive ? 'bulk_reactivate_users' : 'bulk_suspend_users',
    metadata: { count: result.modifiedCount, userIds: filteredIds },
  });

  return { modifiedCount: result.modifiedCount };
}

export async function forcePasswordReset(actorId, userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new BadRequestError('Invalid user id.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const resetToken = generateResetToken();
  user.passwordResetToken = hashResetToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  user.tokenVersion += 1;
  await user.save();

  await sendPasswordResetEmail({
    email: user.email,
    username: user.username,
    resetToken,
  });

  await logAdminAction({
    actorId,
    targetUserId: userId,
    action: 'force_password_reset',
  });

  return { ok: true };
}
