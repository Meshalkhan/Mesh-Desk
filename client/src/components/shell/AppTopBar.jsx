import { ConnectionIndicator } from './ConnectionIndicator.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { useShell } from '../../hooks/useShell.jsx';

const VIEW_META = {
  home: { title: 'Dashboard', meta: 'Workspace overview' },
  ai: { title: 'AI Support', meta: 'Assistant workspace' },
  group: { title: 'Team Chat', meta: 'Live coordination' },
  admin: { title: 'Admin', meta: 'Workspace configuration' },
};

export function AppTopBar({ view, showThreadToggle, threadToggleLabel = 'Threads' }) {
  const { setMobileNavOpen, threadPanelOpen, toggleThreadPanel } = useShell();
  const meta = VIEW_META[view] || VIEW_META.home;

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border-subtle bg-surface px-3 md:px-4">
      <button
        type="button"
        className="rounded-md px-2 py-1.5 text-meta text-ink-muted hover:bg-surface-muted hover:text-ink md:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        ☰
      </button>

      {showThreadToggle ? (
        <button
          type="button"
          className="rounded-md border border-border-subtle px-2.5 py-1.5 text-meta text-ink-muted hover:bg-surface-muted hover:text-ink lg:hidden"
          onClick={toggleThreadPanel}
          aria-expanded={threadPanelOpen}
        >
          {threadToggleLabel}
        </button>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="truncate text-meta text-ink-muted">{meta.meta}</p>
        <p className="truncate text-body font-semibold text-ink">{meta.title}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <ConnectionIndicator />
      </div>
    </header>
  );
}
