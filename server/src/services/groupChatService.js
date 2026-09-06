import { GroupChat } from '../models/GroupChat.js';
import { Message } from '../models/Message.js';
import { triggerPusherEvent } from '../config/pusher.js';
import { GLOBAL_PRESENCE_CHANNEL } from './presenceService.js';
import { AuthError, NotFoundError } from '../utils/appError.js';

function isParticipant(chat, userId) {
  return chat.participants.some(
    (participant) => participant.toString() === userId.toString()
  );
}

async function loadChatOrThrow(chatId, userId) {
  const chat = await GroupChat.findById(chatId).lean();
  if (!chat) {
    throw new NotFoundError('Conversation not found.');
  }
  if (!isParticipant(chat, userId)) {
    throw new AuthError('Forbidden conversation access.', {
      statusCode: 403,
      errorCode: 'AUTH_FORBIDDEN',
    });
  }
  return chat;
}

export async function listGroupChatsForUser(userId) {
  return GroupChat.find({ participants: userId })
    .populate('participants', '_id username email')
    .sort({ updatedAt: -1 })
    .lean();
}

export async function createGroupChatForUser(userId, { name, participants }) {
  const participantSet = new Set([userId.toString(), ...participants]);
  const chat = await GroupChat.create({
    name,
    participants: Array.from(participantSet),
  });
  const hydratedChat = await GroupChat.findById(chat._id)
    .populate('participants', '_id username email')
    .lean();

  await triggerPusherEvent(GLOBAL_PRESENCE_CHANNEL, 'group-chat:new', hydratedChat);
  return hydratedChat;
}

export async function deleteGroupChatForUser(userId, chatId) {
  await loadChatOrThrow(chatId, userId);
  await Message.deleteMany({ chatId });
  await GroupChat.findByIdAndDelete(chatId);
  await triggerPusherEvent(`group-chat-${chatId}`, 'group-chat:deleted', { chatId });
  await triggerPusherEvent(GLOBAL_PRESENCE_CHANNEL, 'group-chat:deleted', { chatId });
  return { ok: true };
}

export async function listGroupMessagesForUser(userId, chatId) {
  await loadChatOrThrow(chatId, userId);
  return Message.find({ chatId })
    .populate('sender', '_id username')
    .sort({ createdAt: 1 })
    .lean();
}

export async function createGroupMessageForUser(userId, chatId, { content }) {
  await loadChatOrThrow(chatId, userId);

  const message = await Message.create({ chatId, sender: userId, content });
  await GroupChat.findByIdAndUpdate(chatId, { updatedAt: new Date() });
  const hydratedMessage = await Message.findById(message._id)
    .populate('sender', '_id username')
    .lean();
  await triggerPusherEvent(`group-chat-${chatId}`, 'message:new', hydratedMessage);
  return hydratedMessage;
}

export async function setGroupTypingForUser(userId, chatId, { isTyping }, username) {
  await loadChatOrThrow(chatId, userId);

  await triggerPusherEvent(`group-chat-${chatId}`, 'typing:update', {
    chatId,
    username,
    isTyping,
  });

  return { ok: true };
}
