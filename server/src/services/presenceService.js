import { UserPresence } from '../models/UserPresence.js';
import { triggerPusherEvent } from '../config/pusher.js';

export const GLOBAL_PRESENCE_CHANNEL = 'meshdesk-global';

export async function broadcastPresence() {
  const onlineUsers = await UserPresence.find({ isOnline: true })
    .select('username -_id')
    .lean();
  await triggerPusherEvent(GLOBAL_PRESENCE_CHANNEL, 'presence:sync', {
    onlineUsers: onlineUsers.map((entry) => entry.username),
  });
}

export async function getOnlineUsernames() {
  const onlineUsers = await UserPresence.find({ isOnline: true })
    .select('username -_id')
    .lean();
  return onlineUsers.map((entry) => entry.username);
}

export async function markUserOnline(user) {
  await UserPresence.findOneAndUpdate(
    { userId: user._id },
    { username: user.username, isOnline: true, lastSeenAt: new Date() },
    { upsert: true, new: true }
  );
  await broadcastPresence();
}

export async function markUserOffline(user) {
  await UserPresence.findOneAndUpdate(
    { userId: user._id },
    { username: user.username, isOnline: false, lastSeenAt: new Date() },
    { upsert: true, new: true }
  );
  await broadcastPresence();
}
