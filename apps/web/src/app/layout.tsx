import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'BrewLite – Đặt đồ uống nhanh',
  description: 'Đặt cà phê, trà sữa và bánh tại BrewLite – nhận tại quầy không cần xếp hàng.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'BrewLite', statusBarStyle: 'default' },
  icons: { icon: '/icons/icon.svg', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  themeColor: '#8a5733',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
