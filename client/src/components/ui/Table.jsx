import { Button } from './Button.jsx';

export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border-subtle/70 bg-surface shadow-sm ${className}`}>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="border-b border-border-subtle bg-surface-muted text-meta text-ink-muted">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-border-subtle/50">{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return <tr className={`motion-safe hover:bg-surface-muted/40 ${className}`}>{children}</tr>;
}

export function TableCell({ children, className = '', header = false }) {
  const Tag = header ? 'th' : 'td';
  return (
    <Tag className={`px-4 py-3 align-middle ${header ? 'font-medium' : ''} ${className}`}>
      {children}
    </Tag>
  );
}

export function SortableHeader({ label, column, sort, order, onSort }) {
  const active = sort === column;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 motion-safe hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}
      <span className="text-[10px] text-ink-subtle" aria-hidden="true">
        {active ? (order === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </button>
  );
}

export function TablePagination({ page, totalPages, onPrevious, onNext, total }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p className="text-sm text-ink-muted">
        Page {page} of {totalPages}
        {total != null ? ` · ${total} total` : ''}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={onPrevious}>
          Previous
        </Button>
        <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function MobileCardList({ children, className = '' }) {
  return <div className={`space-y-3 md:hidden ${className}`}>{children}</div>;
}

export function MobileCard({ children, className = '' }) {
  return (
    <article
      className={`rounded-xl border border-border-subtle/70 bg-surface p-4 shadow-sm motion-safe ${className}`}
    >
      {children}
    </article>
  );
}
