import { useEffect, useState } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './hooks/useToast.jsx';
import { ToastRegistrar } from './components/ToastRegistrar.jsx';
import { OfflineBanner } from './components/OfflineBanner.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { useAuth } from './hooks/useAuth.js';
import { AuthPanel } from './components/AuthPanel.jsx';
import { ChatPage } from './pages/ChatPage.jsx';
import { GroupChatPage } from './pages/GroupChatPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { AppShell } from './components/shell/AppShell.jsx';
import { ConnectionStatusProvider } from './hooks/useConnectionStatus.jsx';
import { useAppMode } from './hooks/useAppMode.js';

function AuthenticatedApp({ currentUser, authState, logout }) {
  const [view, setView] = useState('home');
  const appMode =
    view === 'group' ? 'team' : view === 'home' ? 'home' : view;

  useAppMode(appMode);

  return (
    <ConnectionStatusProvider appMode={appMode === 'home' ? 'ai' : appMode}>
      <AppShell
        view={view}
        onViewChange={setView}
        currentUser={currentUser}
        isAdmin={currentUser?.isAdmin}
        onLogout={logout}
        showThreadToggle={view === 'ai' || view === 'group'}
        threadToggleLabel={view === 'ai' ? 'Threads' : 'Groups'}
      >
        <ErrorBoundary name="app-root" title="MeshDesk encountered an error">
          {view === 'home' && (
            <ErrorBoundary name="dashboard" title="Dashboard unavailable">
              <DashboardPage
                currentUser={currentUser}
                isAdmin={currentUser?.isAdmin}
                onNavigate={setView}
              />
            </ErrorBoundary>
          )}
          {view === 'ai' && (
            <ErrorBoundary name="chat" title="Chat unavailable">
              <ChatPage />
            </ErrorBoundary>
          )}
          {view === 'group' && (
            <ErrorBoundary name="group-chat" title="Team chat unavailable">
              <GroupChatPage currentUser={currentUser} authToken={authState.token} />
            </ErrorBoundary>
          )}
          {view === 'admin' && currentUser?.isAdmin && (
            <ErrorBoundary name="admin" title="Admin panel unavailable">
              <AdminPage />
            </ErrorBoundary>
          )}
        </ErrorBoundary>
      </AppShell>
    </ConnectionStatusProvider>
  );
}

export default function App() {
  const {
    authState,
    currentUser,
    authMode,
    setAuthMode,
    authError,
    isSubmitting,
    handleAuthSubmit,
    logout,
    initToken,
    isAuthenticated,
  } = useAuth();

  useEffect(() => {
    initToken();
  }, [initToken]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <ToastRegistrar />
        <OfflineBanner />
        {!isAuthenticated ? (
          <AuthPanel
            mode={authMode}
            error={authError}
            isSubmitting={isSubmitting}
            onSubmit={handleAuthSubmit}
            onToggleMode={() => setAuthMode((prev) => (prev === 'signup' ? 'login' : 'signup'))}
          />
        ) : (
          <div className="h-screen">
            <AuthenticatedApp
              currentUser={currentUser}
              authState={authState}
              logout={logout}
            />
          </div>
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}
