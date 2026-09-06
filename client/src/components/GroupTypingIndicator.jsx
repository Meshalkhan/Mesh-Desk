export function GroupTypingIndicator({ users }) {
  if (!users?.length) {
    return (
      <p className="px-4 pb-1 text-xs text-ink-muted">&nbsp;</p>
    );
  }

  const label =
    users.length === 1
      ? `${users[0]} is typing…`
      : `${users.slice(0, 2).join(', ')} ${users.length > 2 ? 'and others ' : ''}are typing…`;

  return (
    <p className="px-4 pb-1 text-xs italic text-ink-muted">{label}</p>
  );
}
