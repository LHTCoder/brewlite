/** Trạng thái loading / empty / error dùng chung (yêu cầu Task 4.3) */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div data-testid="skeleton" className={`skeleton ${className}`} aria-hidden="true" />;
}

export function MenuSkeleton() {
  return (
    <div role="status" aria-label="Đang tải menu" className="grid grid-cols-2 gap-3 px-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card space-y-3 p-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = '🧋',
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: string;
}) {
  return (
    <div data-testid="empty-state" className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 text-5xl" aria-hidden="true">
        {icon}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-brew-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" data-testid="error-state" className="mx-4 my-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
      <div className="mb-2 text-3xl" aria-hidden="true">
        ⚠️
      </div>
      <p className="font-semibold text-rose-700">Đã có lỗi xảy ra</p>
      <p className="mt-1 text-sm text-rose-600">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4 px-6 py-2 text-sm">
          Thử lại
        </button>
      )}
    </div>
  );
}

export function Spinner({ label = 'Đang xử lý…' }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
      {label}
    </span>
  );
}
