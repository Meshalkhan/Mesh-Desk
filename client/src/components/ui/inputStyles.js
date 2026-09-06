export const inputBaseClass =
  'w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-ink outline-none motion-safe placeholder:text-ink-muted focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50';

export function inputClass(hasError = false) {
  return `${inputBaseClass} ${
    hasError
      ? 'border-danger/70 focus-visible:border-danger/70 focus-visible:ring-danger/20'
      : 'border-border-subtle focus-visible:border-accent/50 focus-visible:ring-accent/25'
  }`;
}
