export function PageHeader({ title, description, actions, meta, subMeta }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border-subtle bg-surface px-4 py-4 sm:flex-row sm:items-start sm:justify-between md:px-6">
      <div className="min-w-0">
        {meta ? <p className="text-meta text-ink-muted">{meta}</p> : null}
        <h1 className="text-heading text-ink">{title}</h1>
        {subMeta ? <p className="mt-1 text-meta-subtle text-ink-muted">{subMeta}</p> : null}
        {description ? (
          <p className={`max-w-2xl text-body text-ink-muted ${subMeta ? 'mt-2' : 'mt-1'}`}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
