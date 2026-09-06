export function Spinner({ className = '', size = 'md' }) {
  const dim = size === 'sm' ? 'h-5 w-5 border' : size === 'lg' ? 'h-10 w-10 border-2' : 'h-8 w-8 border-2';
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-accent border-t-transparent ${dim} ${className}`}
    />
  );
}
