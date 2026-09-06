export function Panel({ title, description, actions, children, className = '' }) {
  return (
    <section
      className={`rounded-lg border border-border-subtle bg-surface ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-col gap-2 border-b border-border-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? <h2 className="text-heading text-ink">{title}</h2> : null}
            {description ? (
              <p className="mt-0.5 text-meta-subtle text-ink-muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function DashboardGrid({ children, columns = 3, className = '' }) {
  const cols =
    columns === 4
      ? 'sm:grid-cols-2 xl:grid-cols-4'
      : columns === 2
        ? 'sm:grid-cols-2'
        : 'sm:grid-cols-2 lg:grid-cols-3';
  return <div className={`grid gap-4 ${cols} ${className}`}>{children}</div>;
}
