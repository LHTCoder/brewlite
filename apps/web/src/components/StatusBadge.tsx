import type { OrderStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/types';

const styles: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  PAID: 'bg-sky-100 text-sky-800',
  PREPARING: 'bg-violet-100 text-violet-800',
  READY: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-brew-100 text-brew-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span data-testid="status-badge" className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Thanh tiến trình trạng thái đơn (FR-08) */
export function StatusTimeline({ status }: { status: OrderStatus }) {
  const steps: OrderStatus[] = ['PAID', 'PREPARING', 'READY', 'COMPLETED'];
  if (status === 'CANCELLED') return null;
  const idx = status === 'PENDING' ? -1 : steps.indexOf(status);
  return (
    <ol className="flex items-center gap-1" aria-label="Tiến trình đơn hàng">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col items-center gap-1 text-center">
          <span
            className={`h-2.5 w-full rounded-full ${i <= idx ? 'bg-brew-600' : 'bg-brew-100'}`}
            aria-hidden="true"
          />
          <span className={`text-[10px] ${i <= idx ? 'font-semibold text-brew-700' : 'text-brew-400'}`}>
            {STATUS_LABELS[s]}
          </span>
        </li>
      ))}
    </ol>
  );
}
