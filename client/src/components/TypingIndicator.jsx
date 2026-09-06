export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-message-in" aria-live="polite" aria-label="MeshAI is typing">
      <div className="rounded-2xl rounded-bl-md border border-border-subtle/60 bg-bubble-received px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-2 w-2 rounded-full bg-ink-muted animate-bounce-dot"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
