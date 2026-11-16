'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiRequestError, imageSrc } from '@/lib/api';
import type { Product, ProductCategory, User, UserRole } from '@/lib/types';
import { formatVND } from '@/lib/pricing';
import { useAuth } from '@/store/auth';
import { Header } from '@/components/Header';
import { ErrorState, Skeleton } from '@/components/States';
import { useToast } from '@/components/Toast';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  COFFEE: 'Cà phê',
  TEA: 'Trà',
  MILK_TEA: 'Trà sữa',
  SMOOTHIE: 'Sinh tố',
  PASTRY: 'Bánh',
};
const ROLE_LABEL: Record<UserRole, string> = { CUSTOMER: 'Khách hàng', STAFF: 'Nhân viên quầy', MANAGER: 'Quản lý' };

const errText = (e: unknown, fallback: string) => (e instanceof ApiRequestError ? e.message : fallback);

/** Thu nhỏ ảnh về khung vuông 800px JPEG trước khi tải lên (ảnh điện thoại thường vài MB) */
async function toSquareJpeg(file: File, size = 800): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const s = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas
      .getContext('2d')!
      .drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** FR-16 + FR-18: Trang quản lý – sửa menu và quản lý tài khoản nhân viên (chỉ MANAGER) */
export default function ManagePage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'menu' | 'staff'>('menu');

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace('/login?next=/manage');
    else if (user.role !== 'MANAGER') router.replace(user.role === 'STAFF' ? '/staff' : '/');
  }, [hydrated, user, router]);

  if (!hydrated || user?.role !== 'MANAGER') return null;

  return (
    <>
      <Header title="Quản lý cửa hàng" />
      <div className="px-4 pt-3">
        <div role="tablist" className="grid grid-cols-2 gap-2 rounded-xl bg-brew-50 p-1">
          {(
            [
              ['menu', 'Menu'],
              ['staff', 'Nhân viên'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-lg py-2 text-sm font-semibold ${tab === key ? 'bg-white text-brew-800 shadow-sm' : 'text-brew-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4">{tab === 'menu' ? <MenuTab /> : <StaffTab meId={user.id} />}</div>
      </div>
    </>
  );
}

// ---------------- Menu ----------------

function MenuTab() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProducts(await api.admin.products());
    } catch (e) {
      setError(errText(e, 'Lỗi tải menu'));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const replace = (p: Product) => setProducts((list) => list?.map((x) => (x.id === p.id ? p : x)) ?? null);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!products)
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );

  return (
    <div className="space-y-3 pb-6">
      {adding ? (
        <NewProductForm
          onCancel={() => setAdding(false)}
          onCreated={(p) => {
            setProducts((list) => [...(list ?? []), p]);
            setAdding(false);
            toast.show(`Đã thêm món ${p.name}`, 'success');
          }}
        />
      ) : (
        <button type="button" className="btn-primary w-full" onClick={() => setAdding(true)}>
          + Thêm món mới
        </button>
      )}
      <ul className="space-y-3">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} onSaved={replace} />
        ))}
      </ul>
    </div>
  );
}

function ProductRow({ product, onSaved }: { product: Product; onSaved: (p: Product) => void }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    description: product.description ?? '',
    basePrice: String(product.basePrice),
    stock: String(product.stock),
  });

  const save = async () => {
    setBusy(true);
    try {
      const p = await api.admin.updateProduct(product.id, {
        name: form.name,
        description: form.description,
        basePrice: Number(form.basePrice),
        stock: Number(form.stock),
      });
      onSaved(p);
      setEditing(false);
      toast.show(`Đã lưu ${p.name}`, 'success');
    } catch (e) {
      toast.show(errText(e, 'Lỗi lưu món'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async () => {
    setBusy(true);
    try {
      const p = await api.admin.updateProduct(product.id, { isAvailable: !product.isAvailable });
      onSaved(p);
      toast.show(p.isAvailable ? `Đã mở bán ${p.name}` : `Đã ẩn ${p.name} khỏi menu`, 'success');
    } catch (e) {
      toast.show(errText(e, 'Lỗi cập nhật'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const changeImage = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const p = await api.admin.uploadImage(product.id, await toSquareJpeg(file));
      onSaved(p);
      toast.show(`Đã đổi ảnh ${p.name}`, 'success');
    } catch (e) {
      toast.show(errText(e, 'Không tải được ảnh'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={`card ${product.isAvailable ? '' : 'opacity-70'}`} data-testid="manage-product">
      <div className="flex gap-3">
        <label className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-brew-50" title="Đổi ảnh">
          <img src={imageSrc(product.imageUrl)} alt={product.name} className="h-full w-full object-cover" />
          <span className="absolute inset-x-0 bottom-0 bg-brew-900/70 py-0.5 text-center text-[10px] font-semibold text-white">Đổi ảnh</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label={`Đổi ảnh ${product.name}`}
            disabled={busy}
            onChange={(e) => void changeImage(e.target.files?.[0])}
          />
        </label>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{product.name}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${product.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-brew-100 text-brew-500'}`}>
              {product.isAvailable ? 'Đang bán' : 'Đang ẩn'}
            </span>
          </div>
          <p className="text-xs text-brew-400">{CATEGORY_LABEL[product.category]}</p>
          <p className="mt-1 text-sm">
            <b className="text-brew-700">{formatVND(product.basePrice)}</b> · Tồn kho: <b>{product.stock}</b>
          </p>
        </div>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <Field label="Tên món" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Mô tả" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Giá (đ)" value={form.basePrice} inputMode="numeric" onChange={(v) => setForm({ ...form, basePrice: v.replace(/\D/g, '') })} />
            <Field label="Số lượng tồn" value={form.stock} inputMode="numeric" onChange={(v) => setForm({ ...form, stock: v.replace(/\D/g, '') })} />
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setEditing(false)} disabled={busy}>
              Hủy
            </button>
            <button type="button" className="btn-primary flex-1" onClick={save} disabled={busy}>
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn-secondary flex-1 py-2 text-sm" onClick={() => setEditing(true)} disabled={busy}>
            Sửa
          </button>
          <button type="button" className="btn-secondary flex-1 py-2 text-sm" onClick={toggle} disabled={busy}>
            {product.isAvailable ? 'Ẩn khỏi menu' : 'Mở bán lại'}
          </button>
        </div>
      )}
    </li>
  );
}

function NewProductForm({ onCreated, onCancel }: { onCreated: (p: Product) => void; onCancel: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'COFFEE' as ProductCategory, basePrice: '', stock: '50' });

  const create = async () => {
    setBusy(true);
    try {
      onCreated(
        await api.admin.createProduct({
          name: form.name,
          description: form.description || undefined,
          category: form.category,
          basePrice: Number(form.basePrice),
          stock: Number(form.stock),
        }),
      );
    } catch (e) {
      toast.show(errText(e, 'Lỗi thêm món'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card space-y-2">
      <h3 className="font-semibold">Thêm món mới</h3>
      <Field label="Tên món" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Field label="Mô tả" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
      <label className="block text-sm font-medium">
        Danh mục
        <select className="input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Giá (đ)" value={form.basePrice} inputMode="numeric" onChange={(v) => setForm({ ...form, basePrice: v.replace(/\D/g, '') })} />
        <Field label="Số lượng tồn" value={form.stock} inputMode="numeric" onChange={(v) => setForm({ ...form, stock: v.replace(/\D/g, '') })} />
      </div>
      <p className="text-xs text-brew-400">Đồ uống tự có size S/M/L và topping; ảnh có thể đổi sau khi thêm.</p>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel} disabled={busy}>
          Hủy
        </button>
        <button type="button" className="btn-primary flex-1" onClick={create} disabled={busy || form.name.trim().length < 2 || !form.basePrice}>
          Thêm món
        </button>
      </div>
    </section>
  );
}

// ---------------- Nhân viên ----------------

function StaffTab({ meId }: { meId: string }) {
  const toast = useToast();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', fullName: '', password: '', role: 'STAFF' as UserRole });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setUsers(await api.admin.users());
    } catch (e) {
      setError(errText(e, 'Lỗi tải danh sách nhân viên'));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    setBusy(true);
    try {
      const u = await api.admin.createUser(form);
      setUsers((list) => [...(list ?? []), u]);
      setForm({ email: '', fullName: '', password: '', role: 'STAFF' });
      toast.show(`Đã cấp tài khoản ${u.email}`, 'success');
    } catch (e) {
      toast.show(errText(e, 'Lỗi cấp tài khoản'), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-3 pb-6">
      <section className="card space-y-2">
        <h3 className="font-semibold">Cấp tài khoản nhân viên</h3>
        <Field label="Họ tên" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
        <Field label="Email đăng nhập" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Mật khẩu ban đầu" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        <label className="block text-sm font-medium">
          Vai trò
          <select className="input mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
            <option value="STAFF">Nhân viên quầy</option>
            <option value="MANAGER">Quản lý</option>
          </select>
        </label>
        <button
          type="button"
          className="btn-primary w-full"
          onClick={create}
          disabled={busy || form.fullName.trim().length < 2 || !form.email.includes('@') || form.password.length < 8}
        >
          Cấp tài khoản
        </button>
        <p className="text-xs text-brew-400">Mật khẩu tối thiểu 8 ký tự. Gửi mật khẩu này cho nhân viên để đăng nhập lần đầu.</p>
      </section>

      {!users ? (
        <Skeleton className="h-24" />
      ) : (
        <ul className="space-y-3">
          {users.map((u) => (
            <StaffRow key={u.id} user={u} isMe={u.id === meId} onSaved={(nu) => setUsers((l) => l?.map((x) => (x.id === nu.id ? nu : x)) ?? null)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function StaffRow({ user, isMe, onSaved }: { user: User; isMe: boolean; onSaved: (u: User) => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [password, setPassword] = useState('');
  const active = user.isActive !== false;

  const toggle = async () => {
    setBusy(true);
    try {
      const u = await api.admin.setActive(user.id, !active);
      onSaved(u);
      toast.show(u.isActive ? `Đã mở khóa ${u.email}` : `Đã khóa ${u.email}`, 'success');
    } catch (e) {
      toast.show(errText(e, 'Lỗi cập nhật'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      await api.admin.resetPassword(user.id, password);
      setResetting(false);
      setPassword('');
      toast.show(`Đã đặt lại mật khẩu cho ${user.email}`, 'success');
    } catch (e) {
      toast.show(errText(e, 'Lỗi đặt lại mật khẩu'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="card" data-testid="manage-staff">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            {user.fullName} {isMe && <span className="text-xs font-normal text-brew-400">(bạn)</span>}
          </h3>
          <p className="truncate text-sm text-brew-600">{user.email}</p>
          <p className="text-xs text-brew-400">{ROLE_LABEL[user.role]}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {active ? 'Hoạt động' : 'Đã khóa'}
        </span>
      </div>
      {resetting ? (
        <div className="mt-3 flex gap-2">
          <input className="input" placeholder="Mật khẩu mới (≥ 8 ký tự)" aria-label={`Mật khẩu mới cho ${user.email}`} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="btn-primary shrink-0 px-3 text-sm" onClick={reset} disabled={busy || password.length < 8}>
            Lưu
          </button>
          <button type="button" className="btn-secondary shrink-0 px-3 text-sm" onClick={() => setResetting(false)}>
            Hủy
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn-secondary flex-1 py-2 text-sm" onClick={() => setResetting(true)} disabled={busy}>
            Đặt lại mật khẩu
          </button>
          {!isMe && (
            <button type="button" className="btn-secondary flex-1 py-2 text-sm" onClick={toggle} disabled={busy}>
              {active ? 'Khóa' : 'Mở khóa'}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: 'numeric' | 'text';
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input className="input mt-1" type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
