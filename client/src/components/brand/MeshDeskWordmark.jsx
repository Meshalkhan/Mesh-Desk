export function MeshDeskMark({ size = 'md', className = '' }) {
  const sizes = {
    sm: { box: 'h-8 w-8', bar: 'h-3 w-0.5', gap: 'gap-0.5' },
    md: { box: 'h-9 w-9', bar: 'h-4 w-0.5', gap: 'gap-0.5' },
    lg: { box: 'h-12 w-12', bar: 'h-5 w-1', gap: 'gap-1' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={`flex ${s.box} shrink-0 items-end justify-center ${s.gap} ${className}`}
      aria-hidden="true"
    >
      <span className={`${s.bar} rounded-full bg-[rgb(var(--accent-ai))]`} />
      <span className={`${s.bar} rounded-full bg-[rgb(var(--accent-team))]`} />
      <span className={`${s.bar} rounded-full bg-[rgb(var(--accent-ai))] opacity-60`} />
    </div>
  );
}

export function MeshDeskWordmark({ subtitle, className = '' }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <MeshDeskMark />
      <div className="min-w-0">
        <p className="truncate text-body font-semibold tracking-tight text-ink">MeshDesk</p>
        {subtitle ? <p className="truncate text-meta text-ink-muted">{subtitle}</p> : null}
      </div>
    </div>
  );
}
