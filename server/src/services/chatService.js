import mongoose from 'mongoose';
import { Chat } from '../models/Chat.js';
import { resolveModelForChat } from './aiModelService.js';
import { generateAssistantReply } from './llmService.js';

export async function listChats(userId) {
  return Chat.find({ owner: userId })
    .select('title updatedAt createdAt aiModelId')
    .sort({ updatedAt: -1 })
    .lean();
}

export async function createChat(userId, aiModelId = null) {
  return Chat.create({
    title: 'Untitled thread',
    messages: [],
    owner: userId,
    aiModelId: aiModelId || null,
  });
}

export async function getChatById(id, userId) {
  if (!mongoose.isValidObjectId(id)) {
    return { error: 'invalid_id' };
  }
  const chat = await Chat.findOne({ _id: id, owner: userId }).lean();
  if (!chat) return { error: 'not_found' };
  return { chat };
}

export async function deleteChatById(id, userId) {
  if (!mongoose.isValidObjectId(id)) {
    return { error: 'invalid_id' };
  }
  const result = await Chat.findOneAndDelete({ _id: id, owner: userId });
  if (!result) return { error: 'not_found' };
  return { ok: true };
}

export async function appendUserMessageAndReply(id, content, userId, { modelId } = {}) {
  if (!mongoose.isValidObjectId(id)) {
    return { error: 'invalid_id' };
  }

  const trimmed = content.trim();
  const chat = await Chat.findOne({ _id: id, owner: userId });
  if (!chat) return { error: 'not_found' };

  const aiModel = await resolveModelForChat({
    modelId,
    chatModelId: chat.aiModelId,
  });

  if (modelId && String(chat.aiModelId || '') !== String(aiModel.id)) {
    chat.aiModelId = aiModel.id;
  }

  const priorForModel = chat.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const { content: reply, usedModel, fallback } = await generateAssistantReply({
    aiModel,
    priorMessages: priorForModel,
    userMessage: trimmed,
  });

  chat.messages.push({ role: 'user', content: trimmed });
  chat.messages.push({
    role: 'assistant',
    content: reply,
    modelId: usedModel.id,
    modelDisplayName: usedModel.displayName,
    modelProvider: usedModel.provider,
  });

  if (
    (chat.title === 'Untitled thread' || chat.title === 'New conversation') &&
    trimmed.length > 0
  ) {
    chat.title = trimmed.slice(0, 60) + (trimmed.length > 60 ? '…' : '');
  }

  await chat.save();

  return {
    chat: await Chat.findById(id).lean(),
    meta: fallback ? { fallback } : undefined,
  };
}
