import { Button } from './ui/Button.jsx';
import { ListSkeleton } from './ui/Skeleton.jsx';
import { ConversationMenu } from './ui/ConversationMenu.jsx';
import { StatCard } from './ui/StatCard.jsx';
import { formatThreadTitle } from '../lib/formatThreadTitle.js';
import { useShell } from '../hooks/useShell.jsx';

export function Sidebar({
  chats,
  activeId,
  loading,
  onSelect,
  onNew,
  onDelete,
}) {
  const { threadPanelOpen, setThreadPanelOpen } = useShell();

  const aside = (
    <aside className="flex h-full w-full flex-col border-r border-border-subtle bg-surface md:w-[280px] md:shrink-0">
      <div className="border-b border-border-subtle p-3">
        <Button type="button" onClick={onNew} className="w-full">
          New thread
        </Button>
      </div>

      {!loading && chats.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 border-b border-border-subtle p-3">
          <StatCard label="Threads" value={String(chats.length)} />
          <StatCard
            label="Active"
            value={activeId ? '1' : '0'}
            hint={activeId ? 'In progress' : 'None selected'}
          />
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto scroll-thin p-3">
        <p className="px-1 pb-2 text-meta text-ink-muted">Recent threads</p>
        {loading ? <ListSkeleton rows={8} /> : null}
        {!loading && chats.length === 0 ? (
          <div className="px-1 py-2">
            <p className="text-body font-medium text-ink">No threads yet</p>
            <p className="mt-1 text-meta-subtle text-ink-muted">
              Your conversations will appear here. Start one to ask the assistant.
            </p>
          </div>
        ) : null}
        <ul className="space-y-0.5">
          {chats.map((c) => {
            const active = c._id === activeId;
            return (
              <li key={c._id}>
                <div
                  className={`group flex items-center gap-0.5 border-l-2 motion-safe ${
                    active
                      ? 'border-accent bg-accent-muted/60'
                      : 'border-transparent hover:bg-surface-muted'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(c._id);
                      setThreadPanelOpen(false);
                    }}
                    className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-body text-ink"
                    title={formatThreadTitle(c.title)}
                  >
                    {formatThreadTitle(c.title)}
                  </button>
                  <ConversationMenu
                    itemLabel="thread"
                    onDelete={() => onDelete(c._id)}
                    className="shrink-0 pr-1"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );

  return (
    <>
      {threadPanelOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-surface-overlay/30 lg:hidden"
          aria-label="Close threads panel"
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
        {aside}
      </div>
    </>
  );
}
