'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/types';
import { formatVND } from '@/lib/pricing';
import { useAuth } from '@/store/auth';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState, ErrorState, Skeleton } from '@/components/States';
import { useToast } from '@/components/Toast';

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  PAID: { to: 'PREPARING', label: 'Bắt đầu pha chế' },
  PREPARING: { to: 'READY', label: 'Đã xong – gọi khách' },
  READY: { to: 'COMPLETED', label: 'Khách đã nhận' },
};

/** FR-11 Màn hình quầy: nhân viên cập nhật trạng thái đơn */
export default function StaffPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const all = await api.orders.staffAll();
      setOrders(all.filter((o) => ['PAID', 'PREPARING', 'READY'].includes(o.status)));
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Lỗi tải đơn');
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role === 'CUSTOMER') {
      router.replace('/');
      return;
    }
    void load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [hydrated, user, router, load]);

  const advance = async (o: Order) => {
    const n = NEXT[o.status];
    if (!n) return;
    try {
      await api.orders.updateStatus(o.id, n.to);
      toast.show(`${o.code} → ${n.to}`, 'success');
      await load();
    } catch (e) {
      toast.show(e instanceof ApiRequestError ? e.message : 'Lỗi cập nhật', 'error');
    }
  };

  return (
    <>
      <Header title="Quầy pha chế" />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : orders === null ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon="☕" title="Không có đơn cần xử lý" description="Đơn đã thanh toán sẽ xuất hiện ở đây." />
      ) : (
        <ul className="space-y-3 px-4 pt-3">
          {orders.map((o) => (
            <li key={o.id} className="card">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{o.code}</span>
                <StatusBadge status={o.status} />
              </div>
              <ul className="mt-2 text-sm">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.quantity} × {it.productName}
                    {it.sizeName ? ` (${it.sizeName})` : ''}
                    {it.toppings.length ? ` + ${it.toppings.map((t) => t.name).join(', ')}` : ''}
                  </li>
                ))}
              </ul>
              {o.note && <p className="mt-1 text-xs text-amber-700">Ghi chú: {o.note}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-brew-500">{formatVND(o.total)}</span>
                {NEXT[o.status] && (
                  <button type="button" onClick={() => advance(o)} className="btn-primary px-4 py-2 text-sm">
                    {NEXT[o.status]!.label}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
