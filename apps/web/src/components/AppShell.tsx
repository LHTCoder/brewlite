'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { BottomNav } from './BottomNav';
import { ToastProvider } from './Toast';

/** Khung ứng dụng: hydrate store, đăng ký service worker, xử lý 401, bottom nav */
export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth((s) => s.hydrate);
  const logout = useAuth((s) => s.logout);
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

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const hideNav = pathname === '/login' || pathname === '/register';

  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-cream sm:border-x sm:border-brew-100">
        <main className={`flex-1 ${hideNav ? '' : 'pb-24'}`}>{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </ToastProvider>
  );
}
