import { Spinner } from './Spinner.jsx';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled,
  loading = false,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const base =
    'inline-flex items-center justify-center gap-2 font-semibold motion-safe focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50';
  const sizes = {
    sm: 'rounded-md px-3 py-1.5 text-meta',
    md: 'rounded-lg px-5 py-2.5 text-body font-semibold',
    lg: 'rounded-lg px-6 py-3 text-body font-semibold',
  };
  const variants = {
    primary:
      'bg-accent text-white hover:bg-accent-hover',
    secondary:
      'border border-border-subtle bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink',
    ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
    destructive: 'bg-danger text-white hover:bg-danger/90 shadow-sm',
    danger: 'bg-danger text-white hover:bg-danger/90 shadow-sm',
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : null}
      {children}
    </button>
  );
}
