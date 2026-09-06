import { useNetworkStatus } from '../hooks/useNetworkStatus.js';

export function OfflineBanner() {
  const online = useNetworkStatus();

  if (online) {
    return null;
  }

  return (
    <div
      className="border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-950 dark:text-amber-100"
      role="status"
    >
      You&apos;re offline. Reconnecting…
    </div>
  );
}
