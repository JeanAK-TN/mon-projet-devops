export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string;
  stock: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number | string;
}

export interface Order {
  id: number;
  userId: number;
  total: number | string;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}
