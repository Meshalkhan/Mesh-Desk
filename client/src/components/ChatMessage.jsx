import { SafeMessageContent } from './SafeMessageContent.jsx';

function formatTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ChatMessage({ role, content, modelDisplayName, createdAt }) {
  const isUser = role === 'user';
  const timestamp = formatTimestamp(createdAt);

  return (
    <div
      className={`group/message flex w-full animate-message-in ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative max-w-[min(100%,42rem)] px-4 py-3 text-body leading-relaxed motion-safe ${
          isUser
            ? 'rounded-xl rounded-br-sm bg-bubble-sent text-bubble-sent-ink'
            : 'rounded-xl rounded-bl-sm border border-border-subtle bg-bubble-received text-bubble-received-ink'
        }`}
      >
        {!isUser && (
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <p className="text-meta text-accent">Assistant</p>
            {modelDisplayName ? (
              <span className="font-mono text-[11px] text-ink-muted">{modelDisplayName}</span>
            ) : null}
          </div>
        )}

        <SafeMessageContent content={content} invert={isUser} />

        {timestamp ? (
          <time
            dateTime={createdAt}
            className="pointer-events-none absolute -bottom-5 max-w-full truncate font-mono text-[11px] text-ink-subtle opacity-0 transition-opacity duration-150 group-hover/message:opacity-100 group-focus-within/message:opacity-100"
            title={new Date(createdAt).toLocaleString()}
          >
            {timestamp}
          </time>
        ) : null}
      </div>
    </div>
  );
}
