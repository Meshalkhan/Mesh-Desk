export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-shimmer rounded-md bg-gradient-to-r from-surface-muted via-surface-elevated to-surface-muted bg-[length:200%_100%] ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6" aria-label="Loading messages" role="status">
      <div className="flex justify-start">
        <Skeleton className="h-16 w-[min(100%,20rem)] rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-[min(100%,14rem)] rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-24 w-[min(100%,24rem)] rounded-2xl rounded-bl-md" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-2 p-3" aria-label="Loading table" role="status">
      <Skeleton className="h-8 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-3">
          {Array.from({ length: cols }).map((__, col) => (
            <Skeleton key={col} className="h-10 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="space-y-3 md:hidden" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border-subtle/70 bg-surface p-4 shadow-sm">
          <Skeleton className="mb-3 h-4 w-1/3" />
          <SkeletonText lines={3} />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 6, className = '' }) {
  return (
    <ul className={`space-y-1 px-1 ${className}`} aria-label="Loading list" role="status">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i}>
          <Skeleton className="h-10 w-full rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
