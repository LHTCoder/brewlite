'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';
import type { Product, ProductSize, Topping } from '@/lib/types';
import { formatVND, lineUnitPrice } from '@/lib/pricing';
import { useCart } from '@/store/cart';
import { Header } from '@/components/Header';
import { ErrorState, Skeleton } from '@/components/States';
import { useToast } from '@/components/Toast';

/** FR-02 Chi tiết sản phẩm: chọn size, topping, số lượng -> thêm giỏ */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const add = useCart((s) => s.add);

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState<ProductSize | null>(null);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState(1);

  const load = useCallback(async () => {
    setError(null);
    try {
      const p = await api.products.get(id);
      setProduct(p);
      setSize(p.sizes[0] ?? null);
    } catch (e) {
      setError(e instanceof ApiRequestError ? (e.status === 404 ? 'Sản phẩm không tồn tại' : e.message) : 'Lỗi tải dữ liệu');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const unit = useMemo(
    () => (product ? lineUnitPrice({ basePrice: product.basePrice, size, toppings }) : 0),
    [product, size, toppings],
  );

  if (error) {
    return (
      <>
        <Header title="Chi tiết" back="/" />
        <ErrorState message={error} onRetry={load} />
      </>
    );
  }
  if (!product) {
    return (
      <>
        <Header title="Chi tiết" back="/" />
        <div role="status" aria-label="Đang tải" className="space-y-4 p-4">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </>
    );
  }

  const soldOut = product.stock <= 0;
  const toggleTopping = (t: Topping) =>
    setToppings((cur) => (cur.some((x) => x.id === t.id) ? cur.filter((x) => x.id !== t.id) : [...cur, t]));

  const onAdd = () => {
    add(product, size, toppings, quantity);
    toast.show(`Đã thêm ${quantity} × ${product.name} vào giỏ`, 'success');
    router.push('/');
  };

  return (
    <>
      <Header title={product.name} back="/" />
      <div className="px-4 pb-32">
        <img
          src={product.imageUrl ?? '/images/placeholder.svg'}
          alt={product.name}
          className="aspect-[4/3] w-full rounded-2xl bg-brew-50 object-cover"
        />
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="mt-1 text-sm text-brew-500">{product.description}</p>
          </div>
          <span className="whitespace-nowrap text-lg font-bold text-brew-700">{formatVND(product.basePrice)}</span>
        </div>
        <p className={`mt-2 text-xs ${soldOut ? 'text-rose-600' : 'text-brew-400'}`}>
          {soldOut ? 'Món này tạm hết hàng' : `Còn ${product.stock} phần`}
        </p>

        {product.sizes.length > 0 && (
          <fieldset className="mt-5">
            <legend className="mb-2 font-semibold">Chọn size</legend>
            <div className="grid grid-cols-3 gap-2">
              {product.sizes.map((s) => (
                <label
                  key={s.id}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm ${
                    size?.id === s.id ? 'border-brew-600 bg-brew-50 font-semibold text-brew-800' : 'border-brew-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={s.id}
                    checked={size?.id === s.id}
                    onChange={() => setSize(s)}
                    className="sr-only"
                  />
                  <div>{s.name}</div>
                  <div className="text-xs text-brew-500">{s.extraPrice > 0 ? `+${formatVND(s.extraPrice)}` : 'Giá gốc'}</div>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {product.toppings.length > 0 && (
          <fieldset className="mt-5">
            <legend className="mb-2 font-semibold">Topping</legend>
            <div className="space-y-2">
              {product.toppings
                .filter((t) => t.isAvailable)
                .map((t) => {
                  const checked = toppings.some((x) => x.id === t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${
                        checked ? 'border-brew-600 bg-brew-50' : 'border-brew-200 bg-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input type="checkbox" checked={checked} onChange={() => toggleTopping(t)} className="h-4 w-4 accent-brew-600" />
                        {t.name}
                      </span>
                      <span className="text-brew-600">+{formatVND(t.price)}</span>
                    </label>
                  );
                })}
            </div>
          </fieldset>
        )}

        <div className="mt-5 flex items-center justify-between">
          <span className="font-semibold">Số lượng</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Giảm"
              onClick={() => setQuantity((n) => Math.max(1, n - 1))}
              className="h-9 w-9 rounded-full border border-brew-200 bg-white text-lg"
            >
              −
            </button>
            <span data-testid="quantity" className="w-6 text-center font-bold">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Tăng"
              onClick={() => setQuantity((n) => Math.min(product.stock, n + 1))}
              disabled={quantity >= product.stock}
              className="h-9 w-9 rounded-full border border-brew-200 bg-white text-lg disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[64px] z-30 mx-auto w-full max-w-md border-t border-brew-100 bg-white p-4">
        <button type="button" onClick={onAdd} disabled={soldOut} className="btn-primary w-full">
          {soldOut ? 'Hết hàng' : `Thêm vào giỏ · ${formatVND(unit * quantity)}`}
        </button>
      </div>
    </>
  );
}
