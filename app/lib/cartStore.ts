'use client';

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  icon: string;
  image?: string;
  brand: string;
  quantity: number;
};

const STORAGE_KEY = 'Их Наяд Плаза.cart.items.v1';

export function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.id === 'string' && typeof x.name === 'string');
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cart:changed'));
  } catch {
    // ignore
  }
}

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const items = readCart();
  const existing = items.find((x) => x.id === item.id);
  let next: CartItem[];
  if (existing) {
    next = items.map((x) => (x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x));
  } else {
    next = [...items, { ...item, quantity: 1 }];
  }
  writeCart(next);
  return next;
}

export function removeFromCart(id: string) {
  const items = readCart();
  const next = items.filter((x) => x.id !== id);
  writeCart(next);
  return next;
}

export function updateQuantity(id: string, quantity: number) {
  if (quantity < 1) return removeFromCart(id);
  const items = readCart();
  const next = items.map((x) => (x.id === id ? { ...x, quantity } : x));
  writeCart(next);
  return next;
}

export function clearCart() {
  writeCart([]);
  return [];
}

export function getCartTotal(): number {
  const items = readCart();
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(): number {
  const items = readCart();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
