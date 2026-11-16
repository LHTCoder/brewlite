'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, homeFor } from '@/lib/api';
import type { UserRole } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/States';

const ROLE_LABEL: Record<UserRole, string> = { CUSTOMER: 'Khách hàng', STAFF: 'Nhân viên quầy', MANAGER: 'Quản lý' };

export default function AccountPage() {
  const { user, hydrated, logout, setUser } = useAuth();
  const router = useRouter();
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !user) return;
    api.auth.me().then(setUser).catch(() => undefined);
    api.health()
      .then((h) => setVersion(h.version))
      .catch(() => setVersion(null));
  }, [hydrated, user, setUser]);

  if (!hydrated) return null;
  if (!user)
    return (
      <>
        <Header title="Tài khoản" />
        <EmptyState
          icon="👤"
          title="Bạn chưa đăng nhập"
          description="Đăng nhập để đặt đơn và tích điểm thưởng."
          action={
            <Link href="/login?next=/account" className="btn-primary px-6">
              Đăng nhập
            </Link>
          }
        />
      </>
    );

  return (
    <>
      <Header title="Tài khoản" />
      <div className="space-y-4 px-4 pt-3">
        <section className="card flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brew-100 text-2xl">👤</div>
          <div>
            <h2 className="font-bold">{user.fullName}</h2>
            <p className="text-sm text-brew-700">{user.email}</p>
            <p className="text-xs text-brew-400" data-testid="account-role">
              Vai trò: {ROLE_LABEL[user.role]}
            </p>
          </div>
        </section>
        {user.role === 'CUSTOMER' && (
        <section className="card flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Điểm thưởng</h3>
            <p className="text-xs text-brew-500">1 điểm cho mỗi 10.000đ thanh toán</p>
          </div>
          <span data-testid="loyalty-points" className="text-2xl font-bold text-brew-700">
            {user.loyaltyPoints}
          </span>
        </section>
        )}
        {user.role !== 'CUSTOMER' && (
          <p className="card text-sm text-brew-600">
            Tài khoản {ROLE_LABEL[user.role].toLowerCase()} không dùng để mua hàng.{' '}
            <Link href={homeFor(user.role)} className="font-semibold text-brew-700 underline">
              Về màn hình làm việc
            </Link>
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="btn-secondary w-full"
        >
          Đăng xuất
        </button>
        <p className="text-center text-xs text-brew-300">BrewLite · API {version ?? 'không kết nối'}</p>
      </div>
    </>
  );
}
