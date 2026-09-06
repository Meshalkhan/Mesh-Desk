import { MeshDeskMark } from '../brand/MeshDeskWordmark.jsx';
import { useShell } from '../../hooks/useShell.jsx';
import { Button } from '../ui/Button.jsx';

const MODE_STYLES = {
  home: {
    icon: 'bg-[rgb(var(--accent-ai-muted))] text-[rgb(var(--accent-ai))] ring-1 ring-[rgb(var(--accent-ai)/0.2)]',
    active: 'bg-[rgb(var(--accent-ai-muted))]/70 text-[rgb(var(--accent-ai))]',
  },
  ai: {
    icon: 'bg-[rgb(var(--accent-ai-muted))] text-[rgb(var(--accent-ai))] ring-1 ring-[rgb(var(--accent-ai)/0.2)]',
    active: 'bg-[rgb(var(--accent-ai-muted))] text-[rgb(var(--accent-ai))]',
  },
  team: {
    icon: 'bg-[rgb(var(--accent-team-muted))] text-[rgb(var(--accent-team))] ring-1 ring-[rgb(var(--accent-team)/0.2)]',
    active: 'bg-[rgb(var(--accent-team-muted))] text-[rgb(var(--accent-team))]',
  },
  admin: {
    icon: 'bg-surface-muted text-ink-muted ring-1 ring-border-subtle',
    active: 'bg-surface-muted text-ink',
  },
};

function NavItem({ active, mode, collapsed, icon, label, onClick }) {
  const styles = MODE_STYLES[mode] || MODE_STYLES.admin;

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-body font-medium motion-safe ${
        active ? styles.active : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
      } ${collapsed ? 'justify-center px-2' : ''}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-meta font-semibold ${styles.icon}`}
      >
        {icon}
      </span>
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </button>
  );
}

export function AppSidebar({
  view,
  onViewChange,
  currentUser,
  isAdmin,
  onLogout,
}) {
  const { collapsed, toggleCollapsed, mobileNavOpen, setMobileNavOpen } = useShell();

  const pickView = (next) => {
    onViewChange(next);
    setMobileNavOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div
        className={`flex items-center border-b border-border-subtle px-3 py-3 ${
          collapsed ? 'justify-center gap-1' : 'gap-2'
        }`}
      >
        <MeshDeskMark size={collapsed ? 'sm' : 'md'} />
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-meta text-ink-muted motion-safe hover:bg-surface-muted hover:text-ink md:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '»' : '«'}
        </button>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-semibold text-ink">MeshDesk</p>
            <p className="truncate text-meta-subtle text-ink-muted">Workspace</p>
          </div>
        ) : null}
      </div>

      <nav className="flex flex-col gap-1 p-2" aria-label="Main">
        <NavItem
          active={view === 'home'}
          mode="home"
          collapsed={collapsed}
          icon="Hm"
          label="Dashboard"
          onClick={() => pickView('home')}
        />
        <NavItem
          active={view === 'ai'}
          mode="ai"
          collapsed={collapsed}
          icon="AI"
          label="AI Support"
          onClick={() => pickView('ai')}
        />
        <NavItem
          active={view === 'group'}
          mode="team"
          collapsed={collapsed}
          icon="TC"
          label="Team Chat"
          onClick={() => pickView('group')}
        />
        {isAdmin ? (
          <NavItem
            active={view === 'admin'}
            mode="admin"
            collapsed={collapsed}
            icon="Ad"
            label="Admin"
            onClick={() => pickView('admin')}
          />
        ) : null}
      </nav>

      <div className="mt-auto border-t border-border-subtle p-2">
        {currentUser ? (
          <div
            className={`mb-2 flex items-center gap-3 rounded-lg bg-surface-muted px-3 py-2 ${
              collapsed ? 'justify-center px-2' : ''
            }`}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-meta font-semibold text-ink ring-1 ring-border-subtle"
              aria-hidden="true"
            >
              {currentUser.username?.[0]?.toUpperCase() || 'U'}
            </span>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-body font-medium text-ink">{currentUser.username}</p>
                <p className="truncate text-meta-subtle text-ink-muted">{currentUser.email}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {onLogout ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onLogout}
            className={`w-full ${collapsed ? 'px-2' : ''}`}
          >
            {collapsed ? '⎋' : 'Log out'}
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-surface-overlay/40 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border-subtle bg-surface motion-safe md:static md:z-auto md:shrink-0 ${
          collapsed ? 'w-[72px]' : 'w-60'
        } ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
