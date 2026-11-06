import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';

/** WEB-T03: component hiển thị sản phẩm trong menu (FR-01) */
const base: Product = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Cà phê sữa đá',
  description: 'ngon',
  basePrice: 29000,
  imageUrl: null,
  category: 'COFFEE',
  isAvailable: true,
  stock: 10,
  sizes: [],
  toppings: [],
};

describe('ProductCard', () => {
  it('hiển thị tên, giá và link tới trang chi tiết', () => {
    render(<ProductCard product={base} />);
    expect(screen.getByText('Cà phê sữa đá')).toBeInTheDocument();
    expect(screen.getByText(/29.000đ/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', `/products/${base.id}`);
    expect(screen.queryByText('Hết hàng')).not.toBeInTheDocument();
  });

  it('hiển thị nhãn "Hết hàng" khi stock = 0', () => {
    render(<ProductCard product={{ ...base, stock: 0 }} />);
    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true');
  });
});
