import { SafeMessageContent } from './SafeMessageContent.jsx';

function formatTimestamp(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function GroupMessage({ message, isMine }) {
  const timestamp = formatTimestamp(message.createdAt);

  return (
    <article
      className={`group/message max-w-[min(100%,85%)] animate-message-in motion-safe ${
        isMine ? 'ml-auto' : 'mr-auto'
      }`}
    >
      <div
        className={`rounded-xl px-4 py-3 text-body ${
          isMine
            ? 'rounded-br-sm bg-bubble-sent text-bubble-sent-ink'
            : 'rounded-bl-sm border border-border-subtle bg-bubble-received text-bubble-received-ink'
        }`}
      >
        {!isMine && (
          <p className="mb-1 text-meta font-medium text-ink">{message.sender?.username}</p>
        )}
        <SafeMessageContent content={message.content} invert={isMine} />
        {timestamp ? (
          <time
            dateTime={message.createdAt}
            className="mt-1 block font-mono text-[11px] text-ink-subtle opacity-0 transition-opacity group-hover/message:opacity-100 group-focus-within/message:opacity-100"
            title={new Date(message.createdAt).toLocaleString()}
          >
            {timestamp}
          </time>
        ) : null}
      </div>
    </article>
  );
}
