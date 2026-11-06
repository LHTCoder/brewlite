'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import type { Product, ProductCategory } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState, ErrorState, MenuSkeleton } from '@/components/States';
import { Header } from '@/components/Header';

const CATEGORIES: (ProductCategory | 'ALL')[] = ['ALL', 'COFFEE', 'TEA', 'MILK_TEA', 'SMOOTHIE', 'PASTRY'];

/** FR-01 Màn hình menu (MVP Sprint 1) – mobile-first, có loading / empty / error */
export default function MenuPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setError(null);
    setProducts(null);
    try {
      setProducts(await api.products.list());
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Không tải được menu');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    if (!products) return [];
    return products.filter(
      (p) =>
        (category === 'ALL' || p.category === category) &&
        (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase())),
    );
  }, [products, category, q]);

  return (
    <>
      <Header title="BrewLite" />
      <section className="px-4 pt-3">
        <p className="text-sm text-brew-500">Đặt trước – nhận tại quầy, không cần xếp hàng ☕</p>
        <label className="sr-only" htmlFor="search">
          Tìm món
        </label>
        <input
          id="search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm món…"
          className="input mt-3"
        />
      </section>

      <nav aria-label="Danh mục" className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === c ? 'bg-brew-600 text-white' : 'bg-white text-brew-700 shadow-card'
            }`}
          >
            {c === 'ALL' ? 'Tất cả' : CATEGORY_LABELS[c]}
          </button>
        ))}
      </nav>

      <section className="mt-4" aria-live="polite">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : products === null ? (
          <MenuSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title={products.length === 0 ? 'Menu đang trống' : 'Không tìm thấy món phù hợp'}
            description={products.length === 0 ? 'Cửa hàng chưa cập nhật sản phẩm.' : 'Thử từ khóa hoặc danh mục khác.'}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
