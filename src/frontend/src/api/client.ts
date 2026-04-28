import type { AuthResponse, Order, PaginatedProducts, Product, User } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export const api = {
  register: (data: { email: string; password: string; name: string }) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: data }),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: data }),
  me: (token: string) => request<User>('/api/auth/me', { token }),

  listProducts: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== '') acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return request<PaginatedProducts>(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id: number | string) => request<Product>(`/api/products/${id}`),
  createProduct: (data: Partial<Product>, token: string) =>
    request<Product>('/api/products', { method: 'POST', body: data, token }),
  updateProduct: (id: number, data: Partial<Product>, token: string) =>
    request<Product>(`/api/products/${id}`, { method: 'PUT', body: data, token }),
  deleteProduct: (id: number, token: string) =>
    request<null>(`/api/products/${id}`, { method: 'DELETE', token }),

  createOrder: (items: { productId: number; quantity: number }[], token: string) =>
    request<Order>('/api/orders', { method: 'POST', body: { items }, token }),
  listOrders: (token: string) => request<Order[]>('/api/orders', { token }),
  getOrder: (id: number, token: string) => request<Order>(`/api/orders/${id}`, { token }),
};
