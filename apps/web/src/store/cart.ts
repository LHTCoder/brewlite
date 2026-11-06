'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartLine, Product, ProductSize, Topping } from '@/lib/types';
import { cartLineKey } from '@/lib/pricing';

interface CartState {
  lines: CartLine[];
  promotionCode: string | null;
  note: string;
  add: (product: Product, size: ProductSize | null, toppings: Topping[], quantity: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setPromotionCode: (code: string | null) => void;
  setNote: (note: string) => void;
}

/** FR-03 Giỏ hàng – lưu localStorage để F5 không mất (PWA) */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      promotionCode: null,
      note: '',
      add: (product, size, toppings, quantity) =>
        set((state) => {
          const key = cartLineKey(product.id, size?.id ?? null, toppings.map((t) => t.id));
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key ? { ...l, quantity: Math.min(l.quantity + quantity, l.maxStock) } : l,
              ),
            };
          }
          const line: CartLine = {
            key,
            productId: product.id,
            productName: product.name,
            imageUrl: product.imageUrl,
            basePrice: product.basePrice,
            size,
            toppings,
            quantity: Math.min(quantity, product.stock),
            maxStock: product.stock,
          };
          return { lines: [...state.lines, line] };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, l.maxStock) } : l)),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [], promotionCode: null, note: '' }),
      setPromotionCode: (code) => set({ promotionCode: code }),
      setNote: (note) => set({ note }),
    }),
    {
      name: 'brewlite.cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
