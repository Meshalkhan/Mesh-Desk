import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { getStoredModelId, setStoredModelId } from '../shared/modelPreference.js';
import { useToast } from './useToast.jsx';

export function useChat({ enabled = true } = {}) {
  const { warning } = useToast();
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(() => getStoredModelId());
  const [loadingList, setLoadingList] = useState(enabled);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);

  const defaultModelId = useMemo(
    () => models.find((model) => model.isDefault)?.id || models[0]?.id || null,
    [models],
  );

  const effectiveModelId = selectedModelId || defaultModelId;

  const loadModels = useCallback(async () => {
    try {
      const list = await api.listAiModels();
      setModels(list);
      const stored = getStoredModelId();
      if (stored && list.some((model) => model.id === stored)) {
        setSelectedModelId(stored);
      } else if (list.length) {
        const fallback = list.find((model) => model.isDefault)?.id || list[0].id;
        setSelectedModelId(fallback);
      }
    } catch {
      // API wrapper surfaces toast for non-validation failures.
    }
  }, []);

  const refreshList = useCallback(async () => {
    if (!enabled) return [];
    setLoadingList(true);
    try {
      const list = await api.listChats();
      setChats(list);
      return list;
    } catch {
      return [];
    } finally {
      setLoadingList(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setChats([]);
      setActiveId(null);
      setMessages([]);
      setLoadingList(false);
      return;
    }
    loadModels();
    refreshList();
  }, [enabled, loadModels, refreshList]);

  const selectModel = useCallback((modelId) => {
    setSelectedModelId(modelId);
    setStoredModelId(modelId);
  }, []);

  const selectChat = useCallback(
    async (id) => {
      if (!id) return;
      setActiveId(id);
      setLoadingChat(true);
      try {
        const chat = await api.getChat(id);
        setMessages(chat.messages || []);
        if (chat.aiModelId && models.some((model) => model.id === chat.aiModelId)) {
          selectModel(chat.aiModelId);
        }
      } catch {
        // handled globally
      } finally {
        setLoadingChat(false);
      }
    },
    [models, selectModel],
  );

  const newChat = useCallback(async () => {
    setSending(false);
    try {
      const chat = await api.createChat({ aiModelId: effectiveModelId });
      setChats((prev) => [chat, ...prev]);
      setActiveId(chat._id);
      setMessages([]);
      return chat._id;
    } catch {
      return null;
    }
  }, [effectiveModelId]);

  const removeChat = useCallback(
    async (id) => {
      try {
        await api.deleteChat(id);
        setChats((prev) => prev.filter((c) => c._id !== id));
        if (activeId === id) {
          setActiveId(null);
          setMessages([]);
        }
      } catch {
        // handled globally
      }
    },
    [activeId],
  );

  const send = useCallback(
    async (text) => {
      if (!text.trim()) return;
      let id = activeId;
      if (!id) {
        id = await newChat();
        if (!id) return;
      }

      const userMsg = {
        _id: `local-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setSending(true);

      try {
        const chat = await api.sendMessage(id, text.trim(), effectiveModelId);
        setMessages(chat.messages || []);
        if (chat.meta?.fallback?.message) {
          warning(chat.meta.fallback.message);
        }
        setChats((prev) => {
          const next = prev.filter((c) => c._id !== chat._id);
          return [
            {
              _id: chat._id,
              title: chat.title,
              updatedAt: chat.updatedAt,
              createdAt: chat.createdAt,
              aiModelId: chat.aiModelId,
            },
            ...next,
          ];
        });
      } catch {
        setMessages((prev) => prev.filter((m) => m._id !== userMsg._id));
      } finally {
        setSending(false);
      }
    },
    [activeId, newChat, effectiveModelId, warning],
  );

  return {
    chats,
    activeId,
    messages,
    models,
    selectedModelId: effectiveModelId,
    selectModel,
    loadingList,
    loadingChat,
    sending,
    refreshList,
    selectChat,
    newChat,
    removeChat,
    send,
  };
}
