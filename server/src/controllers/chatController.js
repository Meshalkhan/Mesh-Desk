import {
  listChats as listChatsSvc,
  createChat as createChatSvc,
  getChatById,
  deleteChatById,
  appendUserMessageAndReply,
} from '../services/chatService.js';
import { NotFoundError } from '../utils/appError.js';

export async function listChats(req, res) {
  const chats = await listChatsSvc(req.user._id);
  res.json(chats);
}

export async function createChat(req, res) {
  const { aiModelId } = req.body;
  const chat = await createChatSvc(req.user._id, aiModelId || null);
  res.status(201).json(chat);
}

export async function getChat(req, res) {
  const result = await getChatById(req.params.id, req.user._id);
  if (result.error === 'not_found') {
    throw new NotFoundError('Chat not found.');
  }
  res.json(result.chat);
}

export async function deleteChat(req, res) {
  const result = await deleteChatById(req.params.id, req.user._id);
  if (result.error === 'not_found') {
    throw new NotFoundError('Chat not found.');
  }
  res.status(204).send();
}

export async function sendMessage(req, res) {
  const { id } = req.params;
  const { content, modelId } = req.body;

  const result = await appendUserMessageAndReply(id, content, req.user._id, {
    modelId: modelId || null,
  });

  if (result.error === 'not_found') {
    throw new NotFoundError('Chat not found.');
  }

  res.json({
    ...result.chat,
    meta: result.meta,
  });
}
