import * as groupChatService from '../services/groupChatService.js';
import * as presenceService from '../services/presenceService.js';

export async function listGroupChats(req, res) {
  const chats = await groupChatService.listGroupChatsForUser(req.user._id);
  res.json(chats);
}

export async function createGroupChat(req, res) {
  const chat = await groupChatService.createGroupChatForUser(req.user._id, req.body);
  res.status(201).json(chat);
}

export async function deleteGroupChat(req, res) {
  const result = await groupChatService.deleteGroupChatForUser(
    req.user._id,
    req.params.chatId
  );
  res.json(result);
}

export async function listGroupMessages(req, res) {
  const messages = await groupChatService.listGroupMessagesForUser(
    req.user._id,
    req.params.chatId
  );
  res.json(messages);
}

export async function createGroupMessage(req, res) {
  const message = await groupChatService.createGroupMessageForUser(
    req.user._id,
    req.params.chatId,
    req.body
  );
  res.status(201).json(message);
}

export async function updateGroupTyping(req, res) {
  const result = await groupChatService.setGroupTypingForUser(
    req.user._id,
    req.params.chatId,
    req.body,
    req.user.username
  );
  res.json(result);
}

export async function presenceOnlineList(_req, res) {
  const names = await presenceService.getOnlineUsernames();
  res.json(names);
}

export async function presenceOnline(req, res) {
  await presenceService.markUserOnline(req.user);
  res.json({ ok: true });
}

export async function presenceOffline(req, res) {
  await presenceService.markUserOffline(req.user);
  res.json({ ok: true });
}
