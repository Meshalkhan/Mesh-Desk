export function StatCard({ label, value, hint, trend }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface px-4 py-3">
      <p className="text-meta text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-meta-subtle text-ink-muted">{hint}</p> : null}
      {trend ? <p className="mt-1 text-meta text-success">{trend}</p> : null}
    </div>
  );
}
