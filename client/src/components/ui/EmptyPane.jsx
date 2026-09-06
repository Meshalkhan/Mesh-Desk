export function EmptyPane({ title, description, action }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md">
        <h2 className="text-heading text-ink">{title}</h2>
        <p className="mt-2 text-body text-ink-muted">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}
