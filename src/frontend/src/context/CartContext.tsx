import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';

interface CartContextValue {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  updateQty: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add: CartContextValue['add'] = (product, quantity = 1) => {
    setItems((curr) => {
      const existing = curr.find((i) => i.productId === product.id);
      if (existing) {
        return curr.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...curr,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl,
          quantity,
        },
      ];
    });
  };

  const updateQty: CartContextValue['updateQty'] = (productId, quantity) => {
    setItems((curr) =>
      curr
        .map((i) => (i.productId === productId ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const remove: CartContextValue['remove'] = (productId) =>
    setItems((curr) => curr.filter((i) => i.productId !== productId));

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, updateQty, remove, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
