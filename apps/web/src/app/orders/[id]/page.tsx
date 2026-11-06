'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatVND } from '@/lib/pricing';
import { Header } from '@/components/Header';
import { StatusBadge, StatusTimeline } from '@/components/StatusBadge';
import { ErrorState, Skeleton } from '@/components/States';
import { useToast } from '@/components/Toast';

/** FR-08 Xác nhận đơn + theo dõi trạng thái (tự làm mới mỗi 10s khi đơn đang xử lý) */
function OrderDetailInner() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const justPaid = params.get('paid') === '1';
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setOrder(await api.orders.get(id));
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Không tải được đơn hàng');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!order || ['COMPLETED', 'CANCELLED'].includes(order.status)) return;
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [order, load]);

  const cancel = async () => {
    if (!order || !confirm(`Hủy đơn ${order.code}?`)) return;
    setCancelling(true);
    try {
      setOrder(await api.orders.cancel(order.id));
      toast.show('Đã hủy đơn', 'info');
    } catch (e) {
      toast.show(e instanceof ApiRequestError ? e.message : 'Không hủy được đơn', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (error)
    return (
      <>
        <Header title="Đơn hàng" back="/orders" />
        <ErrorState message={error} onRetry={load} />
      </>
    );
  if (!order)
    return (
      <>
        <Header title="Đơn hàng" back="/orders" />
        <div role="status" aria-label="Đang tải" className="space-y-3 p-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </>
    );

  return (
    <>
      <Header title={`Đơn ${order.code}`} back="/orders" />
      <div className="space-y-4 px-4 pb-6 pt-3">
        {justPaid && order.status !== 'PENDING' && (
          <div data-testid="order-confirmation" className="rounded-2xl bg-emerald-50 p-4 text-center">
            <div className="text-4xl" aria-hidden="true">
              ✅
            </div>
            <h2 className="mt-1 text-lg font-bold text-emerald-800">Đặt hàng thành công!</h2>
            <p className="text-sm text-emerald-700">
              Đọc mã <b className="text-base">{order.code}</b> tại quầy để nhận đồ uống.
            </p>
          </div>
        )}

        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Trạng thái</h2>
            <StatusBadge status={order.status} />
          </div>
          <div className="mt-4">
            <StatusTimeline status={order.status} />
          </div>
          {order.status === 'PENDING' && (
            <p className="mt-3 text-xs text-amber-700">Đơn chưa thanh toán. Bạn có thể thanh toán lại hoặc hủy đơn.</p>
          )}
          <p className="mt-2 text-xs text-brew-400">Cập nhật: {new Date(order.updatedAt).toLocaleString('vi-VN')}</p>
        </section>

        <section className="card">
          <h2 className="mb-2 font-semibold">Chi tiết</h2>
          <ul className="divide-y divide-brew-100 text-sm">
            {order.items.map((it) => (
              <li key={it.id} className="py-2">
                <div className="flex justify-between">
                  <span>
                    {it.quantity} × {it.productName}
                    {it.sizeName ? ` (${it.sizeName})` : ''}
                  </span>
                  <span className="font-medium">{formatVND(it.lineTotal)}</span>
                </div>
                {it.toppings.length > 0 && <p className="text-xs text-brew-400">+ {it.toppings.map((t) => t.name).join(', ')}</p>}
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-brew-100 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-brew-500">Tạm tính</dt>
              <dd>{formatVND(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Khuyến mãi {order.promotion?.code}</dt>
                <dd>−{formatVND(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-base font-bold">
              <dt>Tổng cộng</dt>
              <dd>{formatVND(order.total)}</dd>
            </div>
          </dl>
          {order.note && <p className="mt-2 text-xs text-brew-500">Ghi chú: {order.note}</p>}
        </section>

        {order.payment && (
          <section className="card text-sm">
            <h2 className="mb-1 font-semibold">Thanh toán</h2>
            <p>
              {order.payment.method === 'WALLET' ? 'Ví điện tử' : 'Thẻ ngân hàng'} ·{' '}
              <span className={order.payment.status === 'SUCCEEDED' ? 'text-emerald-700' : 'text-rose-600'}>
                {order.payment.status === 'SUCCEEDED' ? 'Thành công' : order.payment.status === 'FAILED' ? 'Thất bại' : 'Đang xử lý'}
              </span>
            </p>
            {order.payment.providerRef && <p className="text-xs text-brew-400">Mã GD: {order.payment.providerRef}</p>}
            {order.payment.failureReason && <p className="text-xs text-rose-600">{order.payment.failureReason}</p>}
          </section>
        )}

        {order.status === 'PENDING' && (
          <div className="flex gap-2">
            <button type="button" onClick={cancel} disabled={cancelling} className="btn-secondary flex-1">
              Hủy đơn
            </button>
            <Link href="/cart" className="btn-primary flex-1">
              Về giỏ hàng
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={null}>
      <OrderDetailInner />
    </Suspense>
  );
}
