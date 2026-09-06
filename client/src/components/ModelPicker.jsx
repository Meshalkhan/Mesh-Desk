export function ModelPicker({ models, value, onChange, disabled }) {
  if (!models.length) {
    return <p className="text-meta-subtle text-ink-muted">No models configured</p>;
  }

  return (
    <label className="flex items-center gap-2 text-meta text-ink-muted">
      <span>Model</span>
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 font-mono text-xs text-ink outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.displayName}
            {model.isDefault ? ' (default)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
