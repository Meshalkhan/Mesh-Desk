import { useCallback, useEffect, useState } from 'react';
import { GroupMessage } from '../components/GroupMessage.jsx';
import { ChatSkeleton, ListSkeleton } from '../components/ui/Skeleton.jsx';
import { useSmartScroll } from '../hooks/useSmartScroll.js';
import { CreateGroupChatModal } from '../components/CreateGroupChatModal.jsx';
import { GroupTypingIndicator } from '../components/GroupTypingIndicator.jsx';
import { ChatInput } from '../components/ChatInput.jsx';
import { Button } from '../components/ui/Button.jsx';
import { AlertBanner } from '../components/ui/AlertBanner.jsx';
import { EmptyPane } from '../components/ui/EmptyPane.jsx';
import { ConversationMenu } from '../components/ui/ConversationMenu.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { useGroupChat } from '../hooks/useGroupChat.js';
import { useConnectionStatus } from '../hooks/useConnectionStatus.jsx';
import { useShell } from '../hooks/useShell.jsx';

export function GroupChatPage({ currentUser, authToken }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState(null);
  const { setTeamStatus } = useConnectionStatus();
  const { threadPanelOpen, setThreadPanelOpen } = useShell();

  const {
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
  } = useGroupChat({
    currentUser,
    authToken,
    enabled: true,
  });

  useEffect(() => {
    setTeamStatus({
      realtimeStatus,
      onlineCount: onlineUsers.length,
      onlineNames: onlineUsers,
    });
    return () => setTeamStatus(null);
  }, [realtimeStatus, onlineUsers, setTeamStatus]);

  const { containerRef, bottomRef, onScroll } = useSmartScroll([
    activeMessages,
    activeTypingUsers,
    loadingMessages,
  ]);

  const handleSend = useCallback(
    async (text) => {
      setError(null);
      try {
        await sendMessage(text.trim());
        sendTyping(false);
      } catch (e) {
        setError(e.message);
      }
    },
    [sendMessage, sendTyping],
  );

  const handleCreate = async (payload) => {
    setError(null);
    try {
      await createChat(payload);
      setIsCreateOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (chatId) => {
    setError(null);
    try {
      await deleteChat(chatId);
    } catch (e) {
      setError(e.message);
    }
  };

  const groupSidebar = (
    <aside className="flex h-full w-full flex-col border-r border-border-subtle bg-surface md:w-[280px]">
      <div className="border-b border-border-subtle p-3">
        <Button type="button" onClick={() => setIsCreateOpen(true)} className="w-full">
          New group
        </Button>
      </div>

      {!loadingList && chats.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 border-b border-border-subtle p-3">
          <StatCard label="Groups" value={String(chats.length)} />
          <StatCard label="Online" value={String(onlineUsers.length)} hint="Teammates now" />
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto scroll-thin p-3">
        <p className="px-1 pb-2 text-meta text-ink-muted">Groups</p>
        {loadingList ? <ListSkeleton rows={6} /> : null}
        {listError ? (
          <div className="space-y-2 px-1">
            <p className="text-body text-danger">{listError}</p>
            <Button size="sm" variant="secondary" onClick={loadWorkspace}>
              Retry
            </Button>
          </div>
        ) : null}
        {!loadingList && !listError && chats.length === 0 ? (
          <div className="px-1 py-2">
            <p className="text-body font-medium text-ink">No groups yet</p>
            <p className="mt-1 text-meta-subtle text-ink-muted">
              Create a group and invite teammates from your workspace.
            </p>
          </div>
        ) : null}
        <ul className="space-y-0.5">
          {chats.map((chat) => {
            const active = chat._id === activeChat?._id;
            return (
              <li key={chat._id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveChat(chat);
                    setThreadPanelOpen(false);
                  }}
                  className={`w-full border-l-2 px-3 py-2.5 text-left motion-safe ${
                    active
                      ? 'border-accent bg-accent-muted/60'
                      : 'border-transparent hover:bg-surface-muted'
                  }`}
                >
                  <p className="truncate text-body font-medium text-ink">{chat.name}</p>
                  <p className="truncate text-meta-subtle text-ink-muted">
                    {chat.participants?.map((p) => p.username).join(', ')}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );

  return (
    <>
      <CreateGroupChatModal
        isOpen={isCreateOpen}
        users={users}
        onlineUsers={onlineUsers}
        onCreate={handleCreate}
        onClose={() => setIsCreateOpen(false)}
      />

      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        {threadPanelOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-surface-overlay/30 lg:hidden"
            aria-label="Close groups panel"
            onClick={() => setThreadPanelOpen(false)}
          />
        ) : null}
        <div
          className={`${
            threadPanelOpen
              ? 'fixed inset-y-0 left-0 z-40 w-[min(100%,280px)] pt-12 shadow-lg lg:static lg:z-auto lg:w-auto lg:pt-0 lg:shadow-none'
              : 'hidden lg:flex lg:h-full lg:shrink-0'
          }`}
        >
          {groupSidebar}
        </div>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-neutral-bg">
          {(error || messagesError) && (
            <AlertBanner variant="error" onDismiss={() => setError(null)}>
              {error || messagesError}
            </AlertBanner>
          )}

          {!activeChat ? (
            <EmptyPane
              title="Pick a group or start one"
              description="Team Chat is for quick coordination — live messages, typing, and who's online."
              action={
                <Button type="button" onClick={() => setIsCreateOpen(true)}>
                  Create group
                </Button>
              }
            />
          ) : (
            <>
              <header className="group flex items-center justify-between gap-3 border-b border-border-subtle bg-surface px-4 py-3">
                <div className="min-w-0">
                  <p className="text-meta text-ink-muted">Active group</p>
                  <h1 className="truncate text-heading text-ink">{activeChat.name}</h1>
                  <p className="text-meta-subtle text-ink-muted">
                    {activeChat.participants?.length} members · {onlineUsers.length} online now
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {messagesError ? (
                    <Button size="sm" variant="secondary" onClick={loadMessagesForActiveChat}>
                      Retry
                    </Button>
                  ) : null}
                  <ConversationMenu
                    itemLabel="group"
                    onDelete={() => handleDelete(activeChat._id)}
                  />
                </div>
              </header>

              <div
                ref={containerRef}
                onScroll={onScroll}
                className="scroll-thin flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 pb-8"
              >
                {loadingMessages ? <ChatSkeleton /> : null}
                {!loadingMessages &&
                  activeMessages.map((message) => (
                    <GroupMessage
                      key={message._id}
                      message={message}
                      isMine={message.sender?._id === currentUser._id}
                    />
                  ))}
                {!loadingMessages && activeMessages.length === 0 ? (
                  <p className="text-center text-meta-subtle text-ink-muted">
                    No messages yet — say hello to the group.
                  </p>
                ) : null}
                <div ref={bottomRef} className="h-px shrink-0" aria-hidden="true" />
              </div>

              <GroupTypingIndicator users={activeTypingUsers} />
              <ChatInput
                onSend={handleSend}
                disabled={loadingMessages || Boolean(messagesError)}
                placeholder="Message the group…"
                onTypingStart={() => sendTyping(true)}
                onTypingStop={() => sendTyping(false)}
              />
            </>
          )}
        </main>
      </div>
    </>
  );
}
