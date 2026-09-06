import { useEffect, useId, useRef, useState } from 'react';
import { useConnectionStatus } from '../../hooks/useConnectionStatus.jsx';

function statusPresentation({ appMode, online, team }) {
  if (!online) {
    return {
      tone: 'offline',
      label: 'Offline',
      detail: 'No network connection. Messages will send when you are back online.',
    };
  }

  if (appMode === 'ai') {
    return {
      tone: 'neutral',
      label: 'Connected',
      detail: 'AI Support mode — no live presence tracking.',
    };
  }

  if (appMode === 'admin') {
    return {
      tone: 'neutral',
      label: 'Connected',
      detail: 'Admin configuration — realtime status applies in Team Chat.',
    };
  }

  const realtime = team?.realtimeStatus;
  if (realtime === 'connected') {
    const count = team?.onlineCount ?? 0;
    return {
      tone: 'live',
      label: count > 0 ? `Live · ${count} online` : 'Live',
      detail:
        count > 0
          ? `Teammates online: ${team.onlineNames?.join(', ') || '—'}`
          : 'Realtime connected. No teammates online right now.',
    };
  }

  if (realtime === 'degraded' || realtime === 'disconnected') {
    return {
      tone: 'warn',
      label: 'Realtime off',
      detail:
        'Team Chat works without live updates. Check Pusher settings in Admin → Integrations.',
    };
  }

  return {
    tone: 'neutral',
    label: 'Connected',
    detail: 'Loading team connection status…',
  };
}

const toneDot = {
  live: 'bg-success',
  warn: 'bg-warning',
  offline: 'bg-ink-subtle',
  neutral: 'bg-ink-muted',
};

export function ConnectionIndicator() {
  const { appMode, online, team } = useConnectionStatus();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef(null);
  const { tone, label, detail } = statusPresentation({ appMode, online, team });

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-meta text-ink-muted motion-safe hover:bg-surface-muted hover:text-ink"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${toneDot[tone]}`} aria-hidden="true" />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {open ? (
        <div
          id={panelId}
          role="tooltip"
          className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-border-subtle bg-surface-elevated p-3 shadow-md motion-safe"
        >
          <p className="text-meta font-medium text-ink">{label}</p>
          <p className="mt-1 text-meta-subtle text-ink-muted">{detail}</p>
        </div>
      ) : null}
    </div>
  );
}
