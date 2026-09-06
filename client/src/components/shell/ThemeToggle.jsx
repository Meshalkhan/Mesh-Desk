import { useTheme } from '../../hooks/useTheme.jsx';

export function ThemeToggle() {
  const { toggle, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-lg text-ink-muted motion-safe hover:bg-surface-muted hover:text-ink"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}
