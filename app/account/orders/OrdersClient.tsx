'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Heart, ShoppingCart, Package, Receipt, Ticket, Copy, Check, RefreshCw } from 'lucide-react';
import { readAuth, restoreSession, extractErrorMessage, type User } from '../../lib/authStore';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../lib/orderStatus';
import Pagination from '../../components/Pagination';

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  ebarimtBillId?: string;
  ebarimtLottery?: string;
  ebarimtQrData?: string;
};

type Order = {
  id?: string;
  _id?: string;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('mn-MN', {
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

function EbarimtBadge({ item }: { item: OrderItem }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.ebarimtBillId) {
      navigator.clipboard.writeText(item.ebarimtBillId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all border border-emerald-200/60"
      >
        <Receipt className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2} />
        <span>{open ? 'И-Баримт нуух' : 'И-Баримт харах'}</span>
        <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full ml-1">E-BARIMT</span>
      </button>
      {open && (
        <div className="mt-3 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3 text-sm shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2">
            <span className="font-bold text-emerald-950 text-xs tracking-wider flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-emerald-600" /> Цахим төлбөрийн баримт
            </span>
            <span className="text-[10px] bg-emerald-700 text-white font-extrabold px-2.5 py-0.5 rounded-full">ЦАХИМ БАРИМТ</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-100">
              <span className="text-gray-500 text-[10px] font-medium block mb-0.5">ДДТД (Билл №):</span>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-gray-900 select-all break-all text-[11px]">{item.ebarimtBillId}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 text-gray-400 hover:text-emerald-600 transition-colors shrink-0"
                  title="Копидох"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {item.ebarimtLottery && (
              <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-100 flex flex-col justify-between">
                <span className="text-gray-500 text-[10px] font-medium block">Сугалааны дугаар:</span>
                <span className="font-black text-emerald-700 text-sm tracking-wider">{item.ebarimtLottery}</span>
              </div>
            )}
          </div>

          {item.ebarimtQrData && (
            <div className="bg-white rounded-xl p-3 text-center border border-emerald-100 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(item.ebarimtQrData)}`}
                alt="Ebarimt QR"
                className="w-28 h-28 mix-blend-multiply rounded-lg"
              />
              <span className="text-[10px] text-emerald-700 font-bold mt-1">E-Barimt QR уншуулах</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── OrderCard ─────────────────────────────────────────────────────────────────

function OrderCard({ order, expanded, onToggle }: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status = ORDER_STATUS[order.orderStatus] ?? { label: order.orderStatus, color: '#6B7280', bg: '#F3F4F6' };
  const payment = PAYMENT_STATUS[order.paymentStatus] ?? { label: order.paymentStatus, color: '#6B7280', bg: '#F3F4F6' };

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 hover:border-primary/30 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4 sm:p-5 hover:bg-gray-50/50 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900 text-sm sm:text-base tracking-tight">#{order.orderNumber}</span>
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                {order.items?.length ?? 0} бараа
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block leading-tight">Нийт дүн</span>
              <span className="font-black text-gray-900 text-sm sm:text-base text-primary whitespace-nowrap">
                {formatPrice(order.total)}
              </span>
            </div>
            <div className={`w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 transition-transform ${expanded ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100/60">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ color: status.color, background: status.bg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
            {status.label}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ color: payment.color, background: payment.bg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: payment.color }} />
            {payment.label}
          </span>
          {order.paymentMethod && (
            <span className="text-xs text-gray-500 ml-auto font-medium">
              Төлбөр: <span className="uppercase text-gray-800 font-semibold">{order.paymentMethod}</span>
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 sm:px-5 py-4 space-y-4 bg-gray-50/30">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Захиалсан бараа</p>
            <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-100 overflow-hidden">
              {order.items.map((item, i) => (
                <div key={i} className="p-3 flex items-center justify-between gap-3 text-sm hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.quantity}ш × {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap">{formatPrice(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between items-baseline text-sm font-extrabold px-1">
              <span className="text-gray-600 text-xs uppercase tracking-wide">Нийт</span>
              <span className="text-lg text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Хүргэлтийн мэдээлэл</p>
            <div className="bg-white rounded-xl p-3.5 border border-gray-100 text-xs text-gray-600 space-y-1">
              <p className="font-bold text-gray-800">{order.customerInfo.lastName} {order.customerInfo.firstName}</p>
              <p className="font-medium text-gray-700">📞 {order.customerInfo.phone}</p>
              {order.customerInfo.email && !order.customerInfo.email.includes('@phone.local') && (
                <p className="text-gray-500">✉️ {order.customerInfo.email}</p>
              )}
              <p className="text-gray-600 pt-0.5 border-t border-gray-100 mt-1">📍 {order.customerInfo.address}</p>
            </div>
          </div>

          {order.items?.[0]?.ebarimtBillId && (
            <div className="pt-1">
              <EbarimtBadge item={order.items[0]} />
            </div>
          )}
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
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const PAGE_SIZE = 5;

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
        setError(extractErrorMessage(data.error, 'Захиалга татаж чадсангүй'));
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

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filter === 'paid') return o.paymentStatus === 'paid';
      if (filter === 'pending') return o.paymentStatus === 'pending';
      return true;
    });
  }, [orders, filter]);

  const pageCount = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

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
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary ring-2 ring-primary/20 shrink-0">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">{user?.lastName} {user?.firstName}</p>
                <p className="text-xs text-gray-500">{user?.phone ?? user?.email}</p>
              </div>
            </div>
          </div>

          <Link href="/account"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
          >
            <UserIcon className="w-4 h-4 shrink-0" strokeWidth={1.8} /> Хувийн мэдээлэл
          </Link>
          <Link href="/checkout"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" strokeWidth={1.8} /> Миний сагс
          </Link>
          <Link href="/account/orders"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary/5 font-medium text-sm transition-colors text-primary"
          >
            <Package className="w-4 h-4 shrink-0" strokeWidth={1.8} /> Захиалгын түүх
          </Link>
        </div>

        {/* Orders list */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Нийт <span className="font-bold text-gray-800">{orders.length}</span> захиалга
            </p>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Шинэчлэх
            </button>
          </div>

          {/* Filter Tabs */}
          {!loading && !error && orders.length > 0 && (
            <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl max-w-sm">
              <button
                type="button"
                onClick={() => { setFilter('all'); setPage(1); }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Бүгд ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => { setFilter('paid'); setPage(1); }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'paid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Төлөгдсөн ({orders.filter((o) => o.paymentStatus === 'paid').length})
              </button>
              <button
                type="button"
                onClick={() => { setFilter('pending'); setPage(1); }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Хүлээгдэж буй ({orders.filter((o) => o.paymentStatus === 'pending').length})
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400 font-medium">Захиалгууд ачааллаж байна...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center shadow-sm">
              <p className="text-red-600 font-medium text-sm mb-3">{error}</p>
              <button
                onClick={fetchOrders}
                className="text-xs font-bold px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                Дахин оролдох
              </button>
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" strokeWidth={1.3} />
              <h3 className="text-base font-bold text-gray-800 mb-1">
                {filter === 'all' ? 'Захиалга байхгүй байна' : 'Энэ ангилалд захиалга олдсонгүй'}
              </h3>
              <p className="text-gray-400 text-xs mb-6">Та манай дэлгүүрээс бараа сонгон захиалах боломжтой</p>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
              >
                Дэлгүүр хэсэх
              </Link>
            </div>
          )}

          {!loading && !error && paginatedOrders.length > 0 && (
            <div className="space-y-4">
              {paginatedOrders.map((order) => {
                const oid = (order.id ?? order._id) as string;
                return (
                  <OrderCard
                    key={oid}
                    order={order}
                    expanded={expandedId === oid}
                    onToggle={() => toggle(oid)}
                  />
                );
              })}

              {pageCount > 1 && (
                <div className="pt-4 flex flex-col items-center gap-2">
                  <Pagination
                    page={page}
                    pageCount={pageCount}
                    onPage={(p) => { setPage(p); setExpandedId(null); }}
                  />
                  <p className="text-[11px] text-gray-400">
                    Нийт {filteredOrders.length} захиалгаас {(page - 1) * PAGE_SIZE + 1}-
                    {Math.min(page * PAGE_SIZE, filteredOrders.length)} харуулж байна
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
