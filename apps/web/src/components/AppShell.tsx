'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { homeFor } from '@/lib/api';
import { useCart } from '@/store/cart';
import { BottomNav } from './BottomNav';
import { ToastProvider } from './Toast';

/** Các trang mua hàng chỉ dành cho khách (hoặc khách chưa đăng nhập) – FR-19 */
export function isShoppingPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    ['/products', '/cart', '/checkout', '/orders'].some((p) => pathname === p || pathname.startsWith(`${p}/`))
  );
}

/** Khung ứng dụng: hydrate store, đăng ký service worker, xử lý 401, phân quyền theo vai trò, bottom nav */
export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth((s) => s.hydrate);
  const logout = useAuth((s) => s.logout);
  const role = useAuth((s) => s.user?.role);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    hydrate();
    void useCart.persist.rehydrate();
  }, [hydrate]);

  useEffect(() => {
    const onUnauthorized = () => {
      logout();
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    };
    window.addEventListener('brewlite:unauthorized', onUnauthorized);
    return () => window.removeEventListener('brewlite:unauthorized', onUnauthorized);
  }, [logout, router, pathname]);

  // Quầy và quản lý không được mua hàng: đưa về màn hình làm việc của vai trò
  const blocked = !!role && role !== 'CUSTOMER' && isShoppingPath(pathname);
  useEffect(() => {
    if (blocked) router.replace(homeFor(role));
  }, [blocked, role, router]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const hideNav = pathname === '/login' || pathname === '/register';

  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-cream sm:border-x sm:border-brew-100">
        <main className={`flex-1 ${hideNav ? '' : 'pb-24'}`}>{blocked ? null : children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </ToastProvider>
  );
}
