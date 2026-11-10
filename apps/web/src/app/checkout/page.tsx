'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';
import type { Order, PaymentMethod } from '@/lib/types';
import { cartSubtotal, formatVND, lineTotal } from '@/lib/pricing';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { Header } from '@/components/Header';
import { Spinner } from '@/components/States';
import { useToast } from '@/components/Toast';

function newIdempotencyKey() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * UC-10 Đặt và thanh toán đơn hàng:
 *  1. Kiểm tra mã KM (tùy chọn) -> 2. POST /orders -> 3. POST /payments (idempotent)
 *  -> 4. điều hướng tới trang xác nhận. Thất bại thanh toán: giữ đơn PENDING, cho thử lại.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { lines, promotionCode, note, setPromotionCode, setNote, clear } = useCart();
  const { user, hydrated } = useAuth();

  const [promoInput, setPromoInput] = useState(promotionCode ?? '');
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('WALLET');
  const [cardNumber, setCardNumber] = useState('');
  const [walletPhone, setWalletPhone] = useState('');
  const [step, setStep] = useState<'idle' | 'ordering' | 'paying'>('idle');
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [idemKey, setIdemKey] = useState(newIdempotencyKey);

  const subtotal = cartSubtotal(lines);
  const discount = promo?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    if (hydrated && !user) router.replace('/login?next=/checkout');
  }, [hydrated, user, router]);

  // Chờ giỏ hàng được nạp lại từ localStorage (F5 / vào thẳng /checkout) rồi mới kiểm tra giỏ trống
  const [cartReady, setCartReady] = useState(false);
  useEffect(() => {
    if (useCart.persist.hasHydrated()) setCartReady(true);
    return useCart.persist.onFinishHydration(() => setCartReady(true));
  }, []);

  useEffect(() => {
    if (cartReady && lines.length === 0 && !pendingOrder) router.replace('/cart');
  }, [cartReady, lines.length, pendingOrder, router]);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    setPromoError(null);
    if (!code) {
      setPromo(null);
      setPromotionCode(null);
      return;
    }
    try {
      const r = await api.promotions.check(code, subtotal);
      if (r.valid) {
        setPromo({ code: r.code, discount: r.discount });
        setPromotionCode(r.code);
        toast.show(`Áp dụng ${r.code}: giảm ${formatVND(r.discount)}`, 'success');
      } else {
        setPromo(null);
        setPromotionCode(null);
        setPromoError(r.reason ?? 'Mã không hợp lệ');
      }
    } catch (e) {
      setPromo(null);
      setPromoError(e instanceof ApiRequestError ? e.message : 'Không kiểm tra được mã');
    }
  };

  const cardValid = useMemo(() => /^\d{16}$/.test(cardNumber.replace(/\s|-/g, '')), [cardNumber]);
  const canSubmit = step === 'idle' && (method === 'WALLET' || cardValid);

  const submit = async () => {
    setPayError(null);
    let order = pendingOrder;
    try {
      if (!order) {
        setStep('ordering');
        order = await api.orders.create({
          items: lines.map((l) => ({
            productId: l.productId,
            sizeId: l.size?.id,
            toppingIds: l.toppings.map((t) => t.id),
            quantity: l.quantity,
          })),
          promotionCode: promo?.code,
          note: note || undefined,
        });
        setPendingOrder(order);
      }
      setStep('paying');
      const payment = await api.payments.pay({
        orderId: order.id,
        method,
        idempotencyKey: idemKey,
        cardNumber: method === 'CARD' ? cardNumber : undefined,
        walletPhone: method === 'WALLET' ? walletPhone || undefined : undefined,
      });
      if (payment.status === 'SUCCEEDED') {
        clear();
        toast.show('Thanh toán thành công!', 'success');
        router.replace(`/orders/${order.id}?paid=1`);
      } else {
        setPayError(payment.failureReason ?? 'Thanh toán thất bại');
        setIdemKey(newIdempotencyKey()); // lần thử lại = giao dịch mới
        setStep('idle');
      }
    } catch (e) {
      setPayError(e instanceof ApiRequestError ? e.message : 'Có lỗi xảy ra, vui lòng thử lại');
      setStep('idle');
    }
  };

  if (!hydrated || !user) return null;

  return (
    <>
      <Header title="Thanh toán" back="/cart" />
      <div className="space-y-4 px-4 pb-40 pt-3">
        <section className="card">
          <h2 className="mb-2 font-semibold">Đơn hàng của bạn</h2>
          <ul className="divide-y divide-brew-100 text-sm">
            {(pendingOrder?.items ?? lines).map((l, i) => (
              <li key={i} className="flex justify-between py-2">
                <span>
                  {l.quantity} × {'productName' in l ? l.productName : ''}
                  <span className="text-brew-400">
                    {'size' in l && l.size ? ` (${l.size.name})` : 'sizeName' in l && l.sizeName ? ` (${l.sizeName})` : ''}
                  </span>
                </span>
                <span>{formatVND('lineTotal' in l ? l.lineTotal : lineTotal(l))}</span>
              </li>
            ))}
          </ul>
          {!pendingOrder && (
            <>
              <label htmlFor="note" className="mt-3 block text-sm font-medium">
                Ghi chú cho quầy
              </label>
              <input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ít đá, ít đường…" className="input mt-1" maxLength={500} />
            </>
          )}
        </section>

        {!pendingOrder && (
          <section className="card">
            <label htmlFor="promo" className="font-semibold">
              Mã khuyến mãi
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="promo"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="WELCOME10"
                className="input uppercase"
              />
              <button type="button" onClick={applyPromo} className="btn-secondary shrink-0 px-4">
                Áp dụng
              </button>
            </div>
            {promoError && (
              <p role="alert" className="mt-2 text-xs text-rose-600">
                {promoError}
              </p>
            )}
            {promo && <p className="mt-2 text-xs text-emerald-700">Đã áp dụng {promo.code}: −{formatVND(promo.discount)}</p>}
          </section>
        )}

        <section className="card">
          <h2 className="font-semibold">Phương thức thanh toán</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['WALLET', 'CARD'] as PaymentMethod[]).map((m) => (
              <label
                key={m}
                className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-medium ${
                  method === m ? 'border-brew-600 bg-brew-50 text-brew-800' : 'border-brew-200 bg-white'
                }`}
              >
                <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                {m === 'WALLET' ? '👛 Ví điện tử' : '💳 Thẻ ngân hàng'}
              </label>
            ))}
          </div>
          {method === 'CARD' ? (
            <div className="mt-3">
              <label htmlFor="card" className="block text-sm font-medium">
                Số thẻ (16 số)
              </label>
              <input
                id="card"
                inputMode="numeric"
                autoComplete="cc-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                aria-invalid={cardNumber.length > 0 && !cardValid}
                className="input mt-1"
              />
              <p className="mt-1 text-xs text-brew-400">Mô phỏng: thẻ kết thúc bằng 0002 sẽ bị từ chối.</p>
            </div>
          ) : (
            <div className="mt-3">
              <label htmlFor="wallet" className="block text-sm font-medium">
                Số điện thoại ví (tùy chọn)
              </label>
              <input id="wallet" inputMode="tel" value={walletPhone} onChange={(e) => setWalletPhone(e.target.value)} placeholder="0901234567" className="input mt-1" />
              <p className="mt-1 text-xs text-brew-400">Mô phỏng: ví có hạn mức 500.000đ / giao dịch.</p>
            </div>
          )}
        </section>

        {payError && (
          <p role="alert" data-testid="payment-error" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {payError} — đơn hàng <b>{pendingOrder?.code}</b> đang chờ, bạn có thể đổi phương thức và thử lại.
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[64px] z-30 mx-auto w-full max-w-md border-t border-brew-100 bg-white p-4">
        <dl className="mb-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-brew-500">Tạm tính</dt>
            <dd>{formatVND(pendingOrder?.subtotal ?? subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brew-500">Giảm giá</dt>
            <dd>−{formatVND(pendingOrder?.discount ?? discount)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Tổng cộng</dt>
            <dd data-testid="checkout-total">{formatVND(pendingOrder?.total ?? total)}</dd>
          </div>
        </dl>
        <button type="button" onClick={submit} disabled={!canSubmit} className="btn-primary w-full" data-testid="pay-button">
          {step === 'ordering' ? <Spinner label="Đang tạo đơn…" /> : step === 'paying' ? <Spinner label="Đang thanh toán…" /> : pendingOrder ? 'Thử thanh toán lại' : 'Đặt đơn & thanh toán'}
        </button>
      </div>
    </>
  );
}
