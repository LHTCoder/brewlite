import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatVND } from '@/lib/pricing';

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  return (
    <Link
      href={`/products/${product.id}`}
      data-testid="product-card"
      aria-disabled={soldOut}
      className="card group relative flex flex-col gap-2 p-3 transition active:scale-[.98]"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-brew-50">
        <img
          src={product.imageUrl ?? '/images/placeholder.svg'}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover ${soldOut ? 'opacity-40 grayscale' : ''}`}
        />
        {soldOut && (
          <span className="absolute inset-x-2 bottom-2 rounded-lg bg-brew-900/80 py-1 text-center text-xs font-semibold text-white">
            Hết hàng
          </span>
        )}
      </div>
      <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{product.name}</h3>
      <div className="mt-auto flex items-center justify-between">
        <span className="font-bold text-brew-700">{formatVND(product.basePrice)}</span>
        {!soldOut && (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brew-600 text-lg leading-none text-white"
          >
            +
          </span>
        )}
      </div>
    </Link>
  );
}
