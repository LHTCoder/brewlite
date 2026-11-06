'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { cartSubtotal, formatVND, lineTotal, lineUnitPrice } from '@/lib/pricing';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/States';

/** FR-03 Giỏ hàng và tính tổng tiền */
export default function CartPage() {
  const { lines, setQuantity, remove } = useCart();
  const user = useAuth((s) => s.user);
  const router = useRouter();
  const subtotal = cartSubtotal(lines);

  const goCheckout = () => {
    if (!user) router.push('/login?next=/checkout');
    else router.push('/checkout');
  };

  return (
    <>
      <Header title="Giỏ hàng" />
      {lines.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Giỏ hàng trống"
          description="Hãy chọn vài món ngon từ menu nhé."
          action={
            <Link href="/" className="btn-primary px-6">
              Xem menu
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-3 px-4 pt-3">
            {lines.map((l) => (
              <li key={l.key} data-testid="cart-line" className="card flex gap-3 p-3">
                <img src={l.imageUrl ?? '/images/placeholder.svg'} alt="" className="h-20 w-20 rounded-xl bg-brew-50 object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{l.productName}</h3>
                    <button type="button" onClick={() => remove(l.key)} aria-label={`Xóa ${l.productName}`} className="text-brew-400">
                      ✕
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-brew-500">
                    {l.size ? `Size ${l.size.name}` : ''}
                    {l.toppings.length > 0 ? ` · ${l.toppings.map((t) => t.name).join(', ')}` : ''}
                  </p>
                  <p className="text-xs text-brew-400">{formatVND(lineUnitPrice(l))} / phần</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label="Giảm" onClick={() => setQuantity(l.key, l.quantity - 1)} className="h-8 w-8 rounded-full border border-brew-200 bg-white">
                        −
                      </button>
                      <span className="w-5 text-center font-semibold">{l.quantity}</span>
                      <button
                        type="button"
                        aria-label="Tăng"
                        disabled={l.quantity >= l.maxStock}
                        onClick={() => setQuantity(l.key, l.quantity + 1)}
                        className="h-8 w-8 rounded-full border border-brew-200 bg-white disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-brew-700">{formatVND(lineTotal(l))}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="fixed inset-x-0 bottom-[64px] z-30 mx-auto w-full max-w-md border-t border-brew-100 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-brew-500">Tạm tính</span>
              <span data-testid="cart-subtotal" className="text-lg font-bold">
                {formatVND(subtotal)}
              </span>
            </div>
            <button type="button" onClick={goCheckout} className="btn-primary w-full">
              {user ? 'Đặt đơn' : 'Đăng nhập để đặt đơn'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
