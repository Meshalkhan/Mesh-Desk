export function AlertBanner({ children, variant = 'error', onDismiss }) {
  const styles = {
    error: 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100',
    info: 'border-accent/30 bg-accent/10 text-ink',
  };
  return (
    <div
      className={`flex items-center justify-center gap-2 border-b px-4 py-2.5 text-center text-sm ${styles[variant] || styles.error}`}
      role="alert"
    >
      <span className="min-w-0 flex-1">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium opacity-80 hover:opacity-100"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
