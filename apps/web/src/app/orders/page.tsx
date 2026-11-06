'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatVND } from '@/lib/pricing';
import { useAuth } from '@/store/auth';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState, ErrorState, Skeleton } from '@/components/States';

/** FR-09 Lịch sử đơn hàng */
export default function OrdersPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setOrders(null);
    try {
      setOrders(await api.orders.mine());
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Không tải được đơn hàng');
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/login?next=/orders');
      return;
    }
    void load();
  }, [hydrated, user, router, load]);

  return (
    <>
      <Header title="Đơn hàng của tôi" />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : orders === null ? (
        <div role="status" aria-label="Đang tải" className="space-y-3 p-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="Chưa có đơn hàng"
          description="Đơn đã đặt sẽ hiển thị ở đây."
          action={
            <Link href="/" className="btn-primary px-6">
              Đặt món ngay
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3 px-4 pt-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} data-testid="order-row" className="card block active:scale-[.99]">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{o.code}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-xs text-brew-500">
                  {new Date(o.createdAt).toLocaleString('vi-VN')} · {o.items.reduce((s, i) => s + i.quantity, 0)} món
                </p>
                <p className="mt-1 line-clamp-1 text-sm text-brew-600">{o.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}</p>
                <p className="mt-2 text-right font-semibold text-brew-700">{formatVND(o.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
