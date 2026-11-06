import Link from 'next/link';
import { EmptyState } from '@/components/States';

export default function NotFound() {
  return (
    <EmptyState
      icon="🔍"
      title="Không tìm thấy trang"
      description="Đường dẫn không tồn tại hoặc đã bị xóa."
      action={
        <Link href="/" className="btn-primary px-6">
          Về menu
        </Link>
      }
    />
  );
}
