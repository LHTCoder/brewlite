'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { cartCount } from '@/lib/pricing';

const items = [
  { href: '/', label: 'Menu', icon: MenuIcon },
  { href: '/cart', label: 'Giỏ hàng', icon: CartIcon },
  { href: '/orders', label: 'Đơn hàng', icon: OrdersIcon },
  { href: '/account', label: 'Tài khoản', icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const count = useCart((s) => cartCount(s.lines));
  const role = useAuth((s) => s.user?.role);

  const navItems = role && role !== 'CUSTOMER' ? [...items.slice(0, 3), { href: '/staff', label: 'Quầy', icon: StaffIcon }, items[3]] : items;

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-brew-100 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' || pathname.startsWith('/products') : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                  active ? 'text-brew-700' : 'text-brew-400'
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
                {href === '/cart' && count > 0 && (
                  <span
                    data-testid="cart-badge"
                    className="absolute right-1/2 top-1 translate-x-4 rounded-full bg-brew-600 px-1.5 text-[10px] font-bold text-white"
                  >
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 8h12a3 3 0 0 1 0 6h-1" />
      <path d="M4 8v6a5 5 0 0 0 5 5h2a5 5 0 0 0 5-5V8" />
      <path d="M4 20h14" />
    </svg>
  );
}
function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 4h2l2.4 11h11.2L21 7H6" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  );
}
function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
function StaffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M7 10V6a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
