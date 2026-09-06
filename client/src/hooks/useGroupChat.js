import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, getApiBaseUrl } from '../services/api.js';
import { GLOBAL_CHANNEL, useRealtime } from './useRealtime.js';

function normalizeChatId(chatId) {
  if (!chatId) return '';
  if (typeof chatId === 'string') return chatId;
  if (typeof chatId === 'object') {
    if (typeof chatId._id === 'string') return chatId._id;
    if (typeof chatId.toString === 'function') return chatId.toString();
  }
  return String(chatId);
}

export function useGroupChat({ currentUser, authToken, enabled }) {
  const realtime = useRealtime();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [typingByChat, setTypingByChat] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [realtimeStatus, setRealtimeStatus] = useState(null);

  const activeMessages = useMemo(
    () => (activeChat ? messagesByChat[activeChat._id] || [] : []),
    [activeChat, messagesByChat]
  );

  const activeTypingUsers = useMemo(
    () => (activeChat ? typingByChat[activeChat._id] || [] : []),
    [activeChat, typingByChat]
  );

  const loadWorkspace = useCallback(async () => {
    setListError(null);
    setLoadingList(true);
    try {
      const [initialChats, activeUsers, availableUsers, health] = await Promise.all([
        api.listGroupChats(),
        api.fetchOnlineUsers(),
        api.listUsers(),
        api.checkRealtimeHealth().catch(() => ({ status: 'error' })),
      ]);
      setChats(initialChats || []);
      setOnlineUsers(activeUsers || []);
      setUsers(availableUsers || []);
      setRealtimeStatus(
        health?.status === 'ok' ? 'connected' : health?.status === 'degraded' ? 'offline' : 'degraded'
      );
      setActiveChat((prev) => {
        if (prev && (initialChats || []).some((c) => c._id === prev._id)) {
          return prev;
        }
        return (initialChats || [])[0] || null;
      });
    } catch (error) {
      setListError(error.message || 'Unable to load group chats.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    loadWorkspace();
  }, [enabled, loadWorkspace]);

  useEffect(() => {
    if (!enabled || !currentUser || !realtime) return;

    api.setOnline().catch(console.error);
    const heartbeat = window.setInterval(() => {
      api.setOnline().catch(console.error);
    }, 25000);

    const handleUnload = () => {
      if (!authToken) return;
      fetch(`${getApiBaseUrl()}/api/group-chats/presence/offline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: '{}',
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener('beforeunload', handleUnload);

    const globalChannel = realtime.subscribe(GLOBAL_CHANNEL);
    globalChannel.bind('presence:sync', (payload) => {
      setOnlineUsers(payload.onlineUsers || []);
    });
    globalChannel.bind('group-chat:new', (chat) => {
      const hasCurrentUser = chat.participants?.some(
        (entry) => entry._id === currentUser._id
      );
      if (!hasCurrentUser) return;
      setChats((prev) => [chat, ...prev.filter((entry) => entry._id !== chat._id)]);
    });
    globalChannel.bind('group-chat:deleted', ({ chatId }) => {
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      setActiveChat((prev) => (prev?._id === chatId ? null : prev));
    });

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('beforeunload', handleUnload);
      realtime.unsubscribe(GLOBAL_CHANNEL);
      api.setOffline().catch(console.error);
    };
  }, [realtime, currentUser, authToken, enabled]);

  const loadMessagesForActiveChat = useCallback(async () => {
    if (!activeChat) return;
    setMessagesError(null);
    setLoadingMessages(true);
    try {
      const chatMessages = await api.fetchGroupMessages(activeChat._id);
      setMessagesByChat((prev) => ({ ...prev, [activeChat._id]: chatMessages }));
    } catch (error) {
      setMessagesError(error.message || 'Could not load messages.');
    } finally {
      setLoadingMessages(false);
    }
  }, [activeChat]);

  useEffect(() => {
    if (!enabled || !activeChat || !realtime) return;

    loadMessagesForActiveChat();

    const channelName = `group-chat-${activeChat._id}`;
    const chatChannel = realtime.subscribe(channelName);

    const onMessage = (message) => {
      const normalizedChatId = normalizeChatId(message.chatId);
      if (!normalizedChatId) return;

      setMessagesByChat((prev) => ({
        ...prev,
        [normalizedChatId]: (prev[normalizedChatId] || []).some(
          (entry) => entry._id === message._id
        )
          ? prev[normalizedChatId]
          : [...(prev[normalizedChatId] || []), message],
      }));

      setChats((prev) =>
        prev.map((chat) =>
          chat._id === normalizedChatId
            ? { ...chat, updatedAt: new Date().toISOString() }
            : chat
        )
      );
    };

    const onTyping = ({ chatId, username, isTyping }) => {
      if (username === currentUser?.username) return;
      setTypingByChat((prev) => {
        const activeList = prev[chatId] || [];
        const nextList = isTyping
          ? Array.from(new Set([...activeList, username]))
          : activeList.filter((user) => user !== username);
        return { ...prev, [chatId]: nextList };
      });
    };

    chatChannel.bind('message:new', onMessage);
    chatChannel.bind('typing:update', onTyping);

    return () => {
      realtime.unsubscribe(channelName);
    };
  }, [activeChat, currentUser, realtime, enabled, loadMessagesForActiveChat]);

  const sendMessage = useCallback(
    async (content) => {
      if (!activeChat) return;
      const message = await api.sendGroupMessage(activeChat._id, { content });
      const normalizedChatId = normalizeChatId(message.chatId) || activeChat._id;
      setMessagesByChat((prev) => ({
        ...prev,
        [normalizedChatId]: (prev[normalizedChatId] || []).some(
          (entry) => entry._id === message._id
        )
          ? prev[normalizedChatId]
          : [...(prev[normalizedChatId] || []), message],
      }));
    },
    [activeChat]
  );

  const createChat = useCallback(async (payload) => {
    const newChat = await api.createGroupChat(payload);
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
    return newChat;
  }, []);

  const deleteChat = useCallback(
    async (chatId) => {
      await api.deleteGroupChat(chatId);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      setActiveChat((prev) => (prev?._id === chatId ? null : prev));
      setMessagesByChat((prev) => {
        const next = { ...prev };
        delete next[chatId];
        return next;
      });
    },
    []
  );

  const sendTyping = useCallback(
    (isTyping) => {
      if (!activeChat) return;
      api.sendGroupTyping(activeChat._id, { isTyping }).catch(console.error);
    },
    [activeChat]
  );

  return {
    chats,
    activeChat,
    setActiveChat,
    activeMessages,
    activeTypingUsers,
    loadingList,
    listError,
    loadingMessages,
    messagesError,
    onlineUsers,
    users,
    realtimeStatus,
    loadWorkspace,
    loadMessagesForActiveChat,
    sendMessage,
    createChat,
    deleteChat,
    sendTyping,
  };
}
