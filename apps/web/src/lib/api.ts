import type { ApiError, AuthResult, Order, PaymentMethod, Payment, Product, User } from './types';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError | null,
  ) {
    super(ApiRequestError.toText(body, status));
  }
  static toText(body: ApiError | null, status: number): string {
    if (!body) return status === 0 ? 'Không kết nối được máy chủ' : `Lỗi ${status}`;
    return Array.isArray(body.message) ? body.message.join('. ') : body.message;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('brewlite.token');
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' });
  } catch {
    throw new ApiRequestError(0, null);
  }
  if (!res.ok) {
    let body: ApiError | null = null;
    try {
      body = (await res.json()) as ApiError;
    } catch {
      /* ignore */
    }
    if (res.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('brewlite:unauthorized'));
    }
    throw new ApiRequestError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  products: {
    list: (params: { category?: string; q?: string } = {}) => {
      const qs = new URLSearchParams();
      if (params.category) qs.set('category', params.category);
      if (params.q) qs.set('q', params.q);
      const s = qs.toString();
      return request<Product[]>(`/products${s ? `?${s}` : ''}`);
    },
    get: (id: string) => request<Product>(`/products/${id}`),
  },
  auth: {
    login: (email: string, password: string) =>
      request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: { email: string; password: string; fullName: string }) =>
      request<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<User>('/auth/me'),
  },
  promotions: {
    check: (code: string, subtotal: number) =>
      request<{ code: string; valid: boolean; discount: number; reason: string | null; description: string }>(
        `/promotions/${encodeURIComponent(code)}?subtotal=${subtotal}`,
      ),
  },
  orders: {
    create: (payload: {
      items: { productId: string; sizeId?: string; toppingIds?: string[]; quantity: number }[];
      promotionCode?: string;
      note?: string;
    }) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
    mine: () => request<Order[]>('/orders/me'),
    get: (id: string) => request<Order>(`/orders/${id}`),
    cancel: (id: string) => request<Order>(`/orders/${id}/cancel`, { method: 'POST' }),
    staffAll: (status?: string) => request<Order[]>(`/orders/staff/all${status ? `?status=${status}` : ''}`),
    updateStatus: (id: string, status: string) =>
      request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  payments: {
    pay: (payload: { orderId: string; method: PaymentMethod; idempotencyKey: string; cardNumber?: string; walletPhone?: string }) =>
      request<Payment>('/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Idempotency-Key': payload.idempotencyKey },
      }),
  },
  health: () => request<{ status: string; version: string }>('/health'),
};
