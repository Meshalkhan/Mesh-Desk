import { Sidebar } from '../components/Sidebar.jsx';
import { MessageList } from '../components/MessageList.jsx';
import { ChatInput } from '../components/ChatInput.jsx';
import { ModelPicker } from '../components/ModelPicker.jsx';
import { EmptyPane } from '../components/ui/EmptyPane.jsx';
import { ConversationMenu } from '../components/ui/ConversationMenu.jsx';
import { formatThreadTitle } from '../lib/formatThreadTitle.js';

export function MainLayout({
  chats,
  activeId,
  messages,
  models,
  selectedModelId,
  onSelectModel,
  loadingList,
  loadingChat,
  sending,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onSend,
}) {
  const activeChat = chats.find((c) => c._id === activeId);

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <Sidebar
        chats={chats}
        activeId={activeId}
        loading={loadingList}
        onSelect={onSelectChat}
        onNew={onNewChat}
        onDelete={onDeleteChat}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-neutral-bg">
        {activeId ? (
          <header className="group flex items-center justify-between gap-3 border-b border-border-subtle bg-surface px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-meta text-ink-muted">Current thread</p>
              <h1 className="truncate text-heading text-ink">
                {formatThreadTitle(activeChat?.title)}
              </h1>
            </div>
            <ConversationMenu
              itemLabel="thread"
              onDelete={() => onDeleteChat(activeId)}
              className="shrink-0"
            />
          </header>
        ) : null}

        <div className="border-b border-border-subtle bg-surface px-4 py-3 md:px-6">
          <p className="mb-2 text-meta text-ink-muted">Assistant model</p>
          <ModelPicker
            models={models}
            value={selectedModelId}
            onChange={onSelectModel}
            disabled={sending || loadingChat}
          />
        </div>

        {!activeId ? (
          <EmptyPane
            title="Start an AI support thread"
            description="Ask about policies, drafts, or customer replies. Your first message creates a thread automatically."
          />
        ) : (
          <MessageList messages={messages} sending={sending} loadingChat={loadingChat} />
        )}

        <ChatInput
          onSend={onSend}
          disabled={sending || (loadingChat && Boolean(activeId))}
          placeholder={activeId ? 'Message the assistant…' : 'Ask the assistant anything…'}
        />
      </main>
    </div>
  );
}
