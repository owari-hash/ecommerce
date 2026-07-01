'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { readAuth, restoreSession, type User } from '../../lib/authStore';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../lib/orderStatus';
import Pagination from '../../components/Pagination';

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address: string;
  };
};

// ── Status helpers ─────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Хүлээгдэж байна', color: '#D97706', bg: '#FEF3C7' },
  processing: { label: 'Боловсруулж байна', color: '#2563EB', bg: '#DBEAFE' },
  delivered:  { label: 'Хүргэгдсэн',       color: '#059669', bg: '#D1FAE5' },
  cancelled:  { label: 'Цуцлагдсан',       color: '#DC2626', bg: '#FEE2E2' },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Төлөгдөөгүй', color: '#D97706' },
  paid:     { label: 'Төлөгдсөн',   color: '#059669' },
  refunded: { label: 'Буцаагдсан',  color: '#6B7280' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(n: number) {
  return n.toLocaleString('mn-MN') + '₮';
}

// ── OrderCard ─────────────────────────────────────────────────────────────────

function OrderCard({ order, expanded, onToggle }: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status = ORDER_STATUS[order.orderStatus] ?? { label: order.orderStatus, color: '#6B7280', bg: '#F3F4F6' };
  const payment = PAYMENT_STATUS[order.paymentStatus] ?? { label: order.paymentStatus, color: '#6B7280' };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex flex-wrap items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        {/* Order number */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">#{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ color: status.color, background: status.bg }}
          >
            {status.label}
          </span>
          <span className="text-xs font-medium" style={{ color: payment.color }}>
            {payment.label}
          </span>
        </div>

        {/* Total */}
        <p className="font-black text-gray-900 text-sm whitespace-nowrap">
          {formatPrice(order.total)}
        </p>

        {/* Chevron */}
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Захиалсан бараа</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 flex-1 min-w-0 truncate pr-2">{item.name}</span>
                  <span className="text-gray-500 whitespace-nowrap">
                    {item.quantity} ширхэг × {formatPrice(item.price)}
                  </span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap ml-3">
                    {formatPrice(item.quantity * item.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between text-sm font-bold">
              <span className="text-gray-700">Нийт дүн</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Shipping info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Хүргэлтийн мэдээлэл</p>
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 space-y-1">
              <p>{order.customerInfo.phone}</p>
              {order.customerInfo.email && <p>{order.customerInfo.email}</p>}
              <p>{order.customerInfo.address}</p>
            </div>
          </div>

          {/* Payment method */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">Төлбөрийн хэлбэр:</span>
            <span>{order.paymentMethod}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OrdersClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    async function init() {
      await restoreSession();
      const u = readAuth();
      if (!u) {
        router.replace('/account?redirect=/account/orders');
        return;
      }
      setUser(u);
      await fetchOrders();
    }
    init();
    const onAuth = () => setUser(readAuth());
    window.addEventListener('auth:changed', onAuth);
    return () => window.removeEventListener('auth:changed', onAuth);
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/orders', { credentials: 'include' });
      if (res.status === 401) {
        router.replace('/account?redirect=/account/orders');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Захиалга татаж чадсангүй');
        return;
      }
      setOrders(Array.isArray(data.data) ? data.data : []);
      setPage(1);
    } catch {
      setError('Сервертэй холбогдох боломжгүй байна');
    } finally {
      setLoading(false);
    }
  }

  const toggle = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-800 mb-8">Захиалгын түүх</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ background: 'var(--color-primary, #D32F2F)' }}
              >
                {user ? `${user.firstName[0]}${user.lastName[0]}` : '?'}
              </div>
              <div>
                <p className="font-bold text-gray-900">{user?.lastName} {user?.firstName}</p>
                <p className="text-xs text-gray-500">{user?.phone ?? user?.email}</p>
              </div>
            </div>
          </div>

          <Link href="/account"
            className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
          >
            👤 Хувийн мэдээлэл
          </Link>
          <Link href="/account/wishlists"
            className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
          >
            ❤️ Хадгалсан бараа
          </Link>
          <Link href="/checkout"
            className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
          >
            🛒 Миний сагс
          </Link>
          <Link href="/account/orders"
            className="block px-4 py-3 rounded-xl bg-primary/5 font-medium text-sm transition-colors"
            style={{ color: 'var(--color-primary, #D32F2F)' }}
          >
            📦 Захиалгын түүх
          </Link>
        </div>

        {/* Orders list */}
        <div className="md:col-span-2">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-primary, #D32F2F)', borderTopColor: 'transparent' }}
              />
              <p className="text-sm text-gray-400">Захиалгууд ачааллаж байна...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-600 font-medium mb-3">{error}</p>
              <button
                onClick={fetchOrders}
                className="text-sm font-bold px-4 py-2 rounded-xl text-white transition-colors"
                style={{ background: 'var(--color-primary, #D32F2F)' }}
              >
                Дахин оролдох
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Захиалга байхгүй байна</h2>
              <p className="text-gray-500 text-sm mb-6">Та одоогоор ямар ч захиалга өгөөгүй байна.</p>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-colors"
                style={{ background: 'var(--color-primary, #D32F2F)' }}
              >
                Дэлгүүр хэсэх
              </Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">
                  Нийт <span className="font-bold text-gray-800">{orders.length}</span> захиалга
                </p>
                <button
                  onClick={fetchOrders}
                  className="text-xs font-medium flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--color-primary, #D32F2F)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Шинэчлэх
                </button>
              </div>

              {orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  expanded={expandedId === order._id}
                  onToggle={() => toggle(order._id)}
                />
              ))}

              <Pagination
                page={page}
                pageCount={Math.ceil(orders.length / PAGE_SIZE)}
                onPage={(p) => { setPage(p); setExpandedId(null); }}
                className="pt-4"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
