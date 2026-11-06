import Link from 'next/link';
import { EmptyState } from '@/components/States';

/** Trang hiển thị khi PWA mất mạng (service worker điều hướng tới đây) */
export default function OfflinePage() {
  return (
    <EmptyState
      icon="📶"
      title="Bạn đang offline"
      description="Kiểm tra kết nối mạng rồi thử lại. Giỏ hàng của bạn vẫn được lưu."
      action={
        <Link href="/" className="btn-primary px-6">
          Thử lại
        </Link>
      }
    />
  );
}
