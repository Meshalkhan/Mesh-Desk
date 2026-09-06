import { ChatMessage } from './ChatMessage.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import { ChatSkeleton } from './ui/Skeleton.jsx';
import { useSmartScroll } from '../hooks/useSmartScroll.js';

export function MessageList({ messages, sending, loadingChat }) {
  const { containerRef, bottomRef, onScroll } = useSmartScroll([messages, sending, loadingChat]);

  if (loadingChat) {
    return <ChatSkeleton />;
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="scroll-thin flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 pb-8 md:px-6"
    >
      {messages.length === 0 && !sending && (
        <p className="py-8 text-center text-meta-subtle text-ink-muted">
          Send a message to start this thread — the assistant keeps context as you go.
        </p>
      )}

      {messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => (
          <ChatMessage
            key={m._id || `${m.role}-${m.createdAt}`}
            role={m.role}
            content={m.content}
            modelDisplayName={m.modelDisplayName}
            createdAt={m.createdAt}
          />
        ))}

      {sending ? <TypingIndicator /> : null}
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden="true" />
    </div>
  );
}
