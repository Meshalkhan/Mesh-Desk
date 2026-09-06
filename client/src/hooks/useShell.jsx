import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'meshdesk-app-sidebar';

const ShellContext = createContext(null);

function readCollapsed() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'collapsed';
}

export function ShellProvider({ children }) {
  const [collapsed, setCollapsedState] = useState(readCollapsed);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [threadPanelOpen, setThreadPanelOpen] = useState(false);

  const setCollapsed = useCallback((value) => {
    setCollapsedState(value);
    localStorage.setItem(STORAGE_KEY, value ? 'collapsed' : 'expanded');
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? 'collapsed' : 'expanded');
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
      mobileNavOpen,
      setMobileNavOpen,
      threadPanelOpen,
      setThreadPanelOpen,
      toggleThreadPanel: () => setThreadPanelOpen((v) => !v),
    }),
    [collapsed, setCollapsed, toggleCollapsed, mobileNavOpen, threadPanelOpen],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error('useShell must be used within ShellProvider');
  }
  return ctx;
}
