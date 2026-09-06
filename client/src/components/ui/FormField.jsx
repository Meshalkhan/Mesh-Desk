import { FieldError } from './FieldError.jsx';

export function FormField({ label, htmlFor, error, children, className = '' }) {
  return (
    <div className={`block text-sm ${className}`}>
      {label ? (
        <label htmlFor={htmlFor} className="mb-1 block text-ink-muted">
          {label}
        </label>
      ) : null}
      {children}
      <FieldError message={error} />
    </div>
  );
}
