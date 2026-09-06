import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus.js';

const ConnectionContext = createContext(null);

export function ConnectionStatusProvider({ children, appMode }) {
  const online = useNetworkStatus();
  const [team, setTeam] = useState(null);

  const setTeamStatus = useCallback((next) => {
    setTeam(next);
  }, []);

  const value = useMemo(
    () => ({
      appMode,
      online,
      team,
      setTeamStatus,
    }),
    [appMode, online, team, setTeamStatus],
  );

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

export function useConnectionStatus() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error('useConnectionStatus must be used within ConnectionStatusProvider');
  }
  return ctx;
}

/** Safe hook for pages outside provider (should not happen). */
export function useConnectionStatusOptional() {
  return useContext(ConnectionContext);
}
