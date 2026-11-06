'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { Spinner } from './States';

/** FR-04 Đăng ký / đăng nhập – validate phía client + hiển thị lỗi từ server */
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';
  const login = useAuth((s) => s.login);

  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (form.password.length < 8) e.password = 'Mật khẩu tối thiểu 8 ký tự';
    if (mode === 'register') {
      if (form.fullName.trim().length < 2) e.fullName = 'Vui lòng nhập họ tên';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res =
        mode === 'login'
          ? await api.auth.login(form.email, form.password)
          : await api.auth.register({
              email: form.email,
              password: form.password,
              fullName: form.fullName,
            });
      login(res.accessToken, res.user);
      router.replace(next);
    } catch (e) {
      setServerError(e instanceof ApiRequestError ? e.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof form, label: string, type = 'text', autoComplete?: string) => (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-err` : undefined}
        className={`input ${errors[name] ? 'border-rose-400' : ''}`}
      />
      {errors[name] && (
        <p id={`${name}-err`} className="mt-1 text-xs text-rose-600">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="text-5xl" aria-hidden="true">
          ☕
        </div>
        <h1 className="mt-2 text-2xl font-bold">{mode === 'login' ? 'Đăng nhập BrewLite' : 'Tạo tài khoản'}</h1>
        <p className="mt-1 text-sm text-brew-500">Đặt trước, nhận ngay tại quầy.</p>
      </div>

      <form onSubmit={submit} noValidate className="space-y-4" data-testid="auth-form">
        {mode === 'register' && field('fullName', 'Họ và tên', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Mật khẩu', 'password', mode === 'login' ? 'current-password' : 'new-password')}

        {serverError && (
          <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {serverError}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner /> : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brew-500">
        {mode === 'login' ? (
          <>
            Chưa có tài khoản?{' '}
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-brew-700">
              Đăng ký
            </Link>
          </>
        ) : (
          <>
            Đã có tài khoản?{' '}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brew-700">
              Đăng nhập
            </Link>
          </>
        )}
      </p>
      {mode === 'login' && (
        <p className="mt-4 text-center text-xs text-brew-400">
          Tài khoản demo: customer@brewlite.dev / Customer@123
        </p>
      )}
    </div>
  );
}
