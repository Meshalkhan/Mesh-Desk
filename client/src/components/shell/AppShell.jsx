import { AppSidebar } from './AppSidebar.jsx';
import { AppTopBar } from './AppTopBar.jsx';
import { ShellProvider } from '../../hooks/useShell.jsx';

export function AppShell({
  view,
  onViewChange,
  currentUser,
  isAdmin,
  onLogout,
  showThreadToggle,
  threadToggleLabel,
  children,
}) {
  return (
    <ShellProvider>
      <div className="flex h-full min-h-0 bg-neutral-bg">
        <AppSidebar
          view={view}
          onViewChange={onViewChange}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onLogout={onLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            view={view}
            showThreadToggle={showThreadToggle}
            threadToggleLabel={threadToggleLabel}
          />
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </ShellProvider>
  );
}
