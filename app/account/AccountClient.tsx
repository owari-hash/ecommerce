'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { readAuth, logout, loginWithPhone, register, sendRegisterOtp, verifyOtp, forgotPasswordSend, forgotPasswordReset, restoreSession, fetchWithAuth, type User } from '../lib/authStore';

// ── Types ────────────────────────────────────────────────────────────────────-

type OrderItem = { productId: string; name: string; quantity: number; price: number };
type Order = {
  _id: string; orderNumber: string; items: OrderItem[];
  total: number; paymentMethod: string; paymentStatus: string;
  orderStatus: string; createdAt: string;
  customerInfo: { firstName: string; lastName: string; phone: string; email?: string; address: string };
};
type EbarimtDoc = {
  billId: string; lottery: string; qrData: string;
  totalAmount: number; totalVAT: number; type: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Хүлээгдэж байна', color: '#D97706', bg: '#FEF3C7' },
  processing: { label: 'Боловсруулж байна', color: '#2563EB', bg: '#DBEAFE' },
  delivered:  { label: 'Хүргэгдсэн', color: '#059669', bg: '#D1FAE5' },
  cancelled:  { label: 'Цуцлагдсан', color: '#DC2626', bg: '#FEE2E2' },
};
const PAYMENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Төлөгдөөгүй', color: '#D97706', bg: '#FEF3C7' },
  paid:     { label: 'Төлөгдсөн',   color: '#059669', bg: '#D1FAE5' },
  refunded: { label: 'Буцаагдсан',  color: '#6B7280', bg: '#F3F4F6' },
};
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtPrice(n: number) { return n.toLocaleString('mn-MN') + '₮'; }

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

// ── EbarimtBadge ─────────────────────────────────────────────────────────────
function EbarimtBadge({ orderNumber }: { orderNumber: string }) {
  const [data, setData] = useState<EbarimtDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    if (open) { setOpen(false); return; }
    if (data || err) { setOpen(true); return; }
    setLoading(true);
    setErr('');
    try {
      const res = await fetchWithAuth(`/api/users/ebarimt/${orderNumber}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setErr(json.error ?? 'И-баримт олдсонгүй');
      }
    } catch {
      setErr('Холбогдох боломжгүй байна');
    } finally {
      setLoading(false);
      setOpen(true);
    }
  }

  return (
    <div>
      <button
        onClick={load}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
      >
        {loading ? <Spinner /> : <span>🧾</span>}
        {open ? 'Хаах' : 'И-Баримт харах'}
      </button>
      {open && err && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500">{err}</div>
      )}
      {open && data && (
        <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-800">И-Баримт</span>
            <span className="text-xs text-emerald-600">{data.type === 'B2B_RECEIPT' ? 'Байгууллага' : 'Хувь хүн'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-gray-500">ДДТД:</span><br/><span className="font-mono font-semibold text-gray-800 break-all">{data.billId}</span></div>
            {data.lottery && <div><span className="text-gray-500">Сугалаа:</span><br/><span className="font-bold text-emerald-700 text-base">{data.lottery}</span></div>}
            <div><span className="text-gray-500">Нийт дүн:</span><br/><span className="font-semibold">{fmtPrice(data.totalAmount)}</span></div>
            {data.totalVAT > 0 && <div><span className="text-gray-500">НӨАТ:</span><br/><span className="font-semibold">{fmtPrice(data.totalVAT)}</span></div>}
          </div>
          {data.qrData && (
            <div className="text-center pt-1">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(data.qrData)}`}
                alt="Ebarimt QR"
                className="mx-auto rounded-lg border border-emerald-200"
                width={120} height={120}
              />
              <p className="text-xs text-gray-400 mt-1">QR код</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── OrderCard ─────────────────────────────────────────────────────────────────
function OrderCard({ order, expanded, onToggle }: { order: Order; expanded: boolean; onToggle: () => void }) {
  const status = ORDER_STATUS[order.orderStatus] ?? { label: order.orderStatus, color: '#6B7280', bg: '#F3F4F6' };
  const payment = PAYMENT_STATUS[order.paymentStatus] ?? { label: order.paymentStatus, color: '#6B7280', bg: '#F3F4F6' };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full text-left px-5 py-4 flex flex-wrap items-center gap-3 hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">#{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: status.color, background: status.bg }}>{status.label}</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: payment.color, background: payment.bg }}>{payment.label}</span>
        </div>
        <p className="font-black text-gray-900 text-sm whitespace-nowrap">{fmtPrice(order.total)}</p>
        <svg className="w-4 h-4 text-gray-400 shrink-0 transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : '' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Захиалсан бараа</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 flex-1 min-w-0 truncate pr-2">{item.name}</span>
                  <span className="text-gray-400 whitespace-nowrap text-xs">{item.quantity}ш × {fmtPrice(item.price)}</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap ml-3">{fmtPrice(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between text-sm font-bold">
              <span className="text-gray-600">Нийт</span>
              <span className="text-primary">{fmtPrice(order.total)}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Хүргэлт</p>
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 space-y-0.5">
              <p>{order.customerInfo.lastName} {order.customerInfo.firstName}</p>
              <p>{order.customerInfo.phone}</p>
              {order.customerInfo.email && !order.customerInfo.email.includes('@phone.local') && <p>{order.customerInfo.email}</p>}
              <p>{order.customerInfo.address}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Төлбөр: <span className="font-medium text-gray-700">{order.paymentMethod}</span></span>
            {order.paymentStatus === 'paid' && <EbarimtBadge orderNumber={order.orderNumber} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/account';

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [section, setSection] = useState<'profile' | 'orders'>('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Login
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');

  // Forgot password
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [forgotConfirmPw, setForgotConfirmPw] = useState('');

  // Profile edit
  const [editMode, setEditMode] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      await restoreSession();
      const u = readAuth();
      setUser(u);
      setPageLoading(false);
    }
    init();
    const onAuth = () => setUser(readAuth());
    window.addEventListener('auth:changed', onAuth);
    return () => window.removeEventListener('auth:changed', onAuth);
  }, []);

  useEffect(() => {
    if (user && section === 'orders') fetchOrders();
  }, [user, section]);

  useEffect(() => {
    if (user) {
      setEditFirstName(user.firstName || '');
      setEditLastName(user.lastName || '');
      setEditEmail(user.email?.includes('@phone.local') ? '' : (user.email || ''));
      setEditPhone(user.phone || '');
    }
  }, [user]);

  function switchTab(tab: 'login' | 'register' | 'forgot') {
    setActiveTab(tab); setError(''); setSuccess('');
  }

  async function fetchOrders() {
    setOrdersLoading(true); setOrdersError('');
    try {
      const res = await fetchWithAuth('/api/users/orders');
      if (res.status === 401) { router.replace('/account?redirect=/account'); return; }
      const data = await res.json();
      if (!res.ok) { setOrdersError(data.error ?? 'Захиалга татаж чадсангүй'); return; }
      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch { setOrdersError('Сервертэй холбогдох боломжгүй байна'); }
    finally { setOrdersLoading(false); }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName: editFirstName, lastName: editLastName, email: editEmail || undefined, phone: editPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Хадгалахад алдаа гарлаа'); }
      else {
        setUser(data);
        setSuccess('Мэдээлэл амжилттай хадгалагдлаа');
        setEditMode(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch { setError('Сервертэй холбогдох боломжгүй байна'); }
    finally { setLoading(false); }
  }

  // ── Login handlers ──────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!loginPhone || !loginPassword) { setError('Утасны дугаар болон нууц үгээ оруулна уу'); return; }
    setLoading(true);
    const result = await loginWithPhone(loginPhone, loginPassword);
    setLoading(false);
    if (result.success) {
      setUser(readAuth());
      setTimeout(() => router.replace(redirectTo), 200);
    } else setError(result.error || 'Нэвтрэх амжилтгүй боллоо');
  }

  // ── Register handlers ────────────────────────────────────────────────────────
  async function handleSendRegisterOtp(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!regPhone || regPhone.length < 8) { setError('Зөв утасны дугаар оруулна уу'); return; }
    if (!regPassword || regPassword.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return; }
    if (regPassword !== regConfirm) { setError('Нууц үг таарахгүй байна'); return; }
    setLoading(true);
    const result = await sendRegisterOtp(regPhone);
    setLoading(false);
    if (result.success) setRegOtpSent(true);
    else setError(result.error || 'OTP илгээхэд алдаа гарлаа');
  }

  async function handleVerifyRegisterOtp(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!regOtpCode || regOtpCode.length !== 6) { setError('6 оронтой OTP код оруулна уу'); return; }
    setLoading(true);
    const result = await register({ phone: regPhone, email: `${regPhone}@phone.local`, password: regPassword, firstName: regPhone, lastName: '', otpCode: regOtpCode } as any);
    setLoading(false);
    if (result.success) {
      setUser(readAuth());
      setSuccess('Амжилттай бүртгүүллээ!');
      setTimeout(() => router.replace(redirectTo), 300);
    } else setError(result.error || 'Бүртгэл амжилтгүй боллоо');
  }

  // ── Forgot password handlers ─────────────────────────────────────────────────
  async function handleSendForgotOtp(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!forgotPhone || forgotPhone.length < 8) { setError('Зөв утасны дугаар оруулна уу'); return; }
    setLoading(true);
    const result = await forgotPasswordSend(forgotPhone);
    setLoading(false);
    if (result.success) setForgotOtpSent(true);
    else setError(result.error || 'OTP илгээхэд алдаа гарлаа');
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!forgotOtpCode || forgotOtpCode.length !== 6) { setError('6 оронтой OTP код оруулна уу'); return; }
    if (!forgotNewPw || forgotNewPw.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return; }
    if (forgotNewPw !== forgotConfirmPw) { setError('Нууц үг таарахгүй байна'); return; }
    setLoading(true);
    const result = await forgotPasswordReset(forgotPhone, forgotOtpCode, forgotNewPw);
    setLoading(false);
    if (result.success) {
      setSuccess('Нууц үг амжилттай солигдлоо! Нэвтэрнэ үү.');
      setTimeout(() => { switchTab('login'); setLoginPhone(forgotPhone); }, 1500);
    } else setError(result.error || 'Нууц үг сэргээхэд алдаа гарлаа');
  }

  async function handleLogout() {
    await logout(); setUser(null);
    setLoginPhone(''); setLoginPassword('');
    setOrders([]); setSection('profile'); setActiveTab('login');
  }

  const initials = user ? `${(user.firstName || '?')[0]}${(user.lastName || '')[0] || ''}` : '?';
  const displayName = user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : '';

  // ── Loading ────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  if (user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8">
        <div className="grid md:grid-cols-[260px_1fr] gap-4 sm:gap-6">

          {/* Sidebar */}
          <aside className="space-y-3">
            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex sm:flex-col items-center sm:text-center gap-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/30">
                {initials}
              </div>
              <div>
                <p className="font-bold text-gray-900">{displayName || user.phone}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
                {user.email && !user.email.includes('@phone.local') && (
                  <p className="text-xs text-gray-400">{user.email}</p>
                )}
              </div>
            </div>

            {/* Nav */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {[
                { id: 'profile', icon: '👤', label: 'Хувийн мэдээлэл' },
                { id: 'orders', icon: '📦', label: 'Захиалгын түүх' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id as 'profile' | 'orders')}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors text-left ${
                    section === item.id ? 'bg-primary/5 text-primary font-semibold border-l-[3px] border-primary' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
              <Link href="/account/wishlists" className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <span>❤️</span>Хадгалсан бараа
              </Link>
              <Link href="/checkout" className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <span>🛒</span>Миний сагс
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <span>🚪</span>Гарах
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className="space-y-4">
            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-600">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                {success}
              </div>
            )}

            {/* Profile section */}
            {section === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Хувийн мэдээлэл</h2>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Засах
                    </button>
                  )}
                </div>

                {!editMode ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Овог', value: user.lastName },
                      { label: 'Нэр', value: user.firstName },
                      { label: 'Утасны дугаар', value: user.phone },
                      { label: 'И-мэйл', value: user.email?.includes('@phone.local') ? '—' : user.email },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                        <div className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-700">{f.value || '—'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Овог</label>
                        <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50" placeholder="Овог" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Нэр</label>
                        <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50" placeholder="Нэр" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Утасны дугаар</label>
                        <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50" placeholder="99xxxxxx" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">И-мэйл</label>
                        <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50" placeholder="email@example.com" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button type="submit" disabled={loading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/20 disabled:opacity-60">
                        {loading && <Spinner />} Хадгалах
                      </button>
                      <button type="button" onClick={() => { setEditMode(false); setError(''); }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                        Цуцлах
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Orders section */}
            {section === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Захиалгын түүх</h2>
                  <button onClick={fetchOrders} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Шинэчлэх
                  </button>
                </div>

                {ordersLoading && (
                  <div className="flex flex-col items-center py-16 gap-3">
                    <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Захиалгууд ачааллаж байна...</p>
                  </div>
                )}

                {!ordersLoading && ordersError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <p className="text-red-600 font-medium mb-3">{ordersError}</p>
                    <button onClick={fetchOrders} className="text-sm font-bold px-4 py-2 rounded-xl text-white bg-primary">Дахин оролдох</button>
                  </div>
                )}

                {!ordersLoading && !ordersError && orders.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="text-5xl mb-4">📦</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Захиалга байхгүй</h3>
                    <p className="text-gray-500 text-sm mb-6">Та одоогоор ямар ч захиалга өгөөгүй байна.</p>
                    <Link href="/" className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-primary">Дэлгүүр хэсэх</Link>
                  </div>
                )}

                {!ordersLoading && !ordersError && orders.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">Нийт <span className="font-bold text-gray-700">{orders.length}</span> захиалга</p>
                    {orders.map(order => (
                      <OrderCard
                        key={order._id} order={order}
                        expanded={expandedId === order._id}
                        onToggle={() => setExpandedId(p => p === order._id ? null : order._id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  const phoneIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;
  const lockIcon  = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>;
  const inputCls = "w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {activeTab === 'login' ? 'Нэвтрэх' : activeTab === 'register' ? 'Бүртгүүлэх' : 'Нууц үг сэргээх'}
          </h1>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-600">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            {success}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-7">

          {/* Tab switcher — only login/register */}
          {activeTab !== 'forgot' && (
            <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
              <button onClick={() => switchTab('login')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                Нэвтрэх
              </button>
              <button onClick={() => switchTab('register')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                Бүртгүүлэх
              </button>
            </div>
          )}

          {/* ── LOGIN ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{phoneIcon}</span>
                <input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value)}
                  className={inputCls} placeholder="Утасны дугаар" maxLength={12} autoFocus />
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{lockIcon}</span>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  className={inputCls} placeholder="Нууц үг" />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => switchTab('forgot')}
                  className="text-xs text-primary hover:underline">Нууц үг мартсан?</button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-60">
                {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Нэвтэрж байна...</span> : 'Нэвтрэх'}
              </button>
            </form>
          )}

          {/* ── REGISTER ── */}
          {activeTab === 'register' && (
            <>
              {!regOtpSent ? (
                <form onSubmit={handleSendRegisterOtp} className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{phoneIcon}</span>
                    <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      className={inputCls} placeholder="Утасны дугаар" maxLength={12} autoFocus />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{lockIcon}</span>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      className={inputCls} placeholder="Нууц үг (6+ тэмдэгт)" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{lockIcon}</span>
                    <input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                      className={inputCls} placeholder="Нууц үг давтах" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-60">
                    {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Илгээж байна...</span> : 'Код авах'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 text-center">
                    📱 <span className="font-semibold">{regPhone}</span>-д баталгаажуулах код илгээлээ
                  </div>
                  <input type="text" inputMode="numeric" value={regOtpCode}
                    onChange={e => setRegOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    placeholder="──────" maxLength={6} autoFocus />
                  <button type="submit" disabled={loading || regOtpCode.length !== 6}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50">
                    {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Шалгаж байна...</span> : 'Бүртгүүлэх'}
                  </button>
                  <button type="button" onClick={() => { setRegOtpSent(false); setRegOtpCode(''); setError(''); }}
                    className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">← Буцах</button>
                </form>
              )}
            </>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {activeTab === 'forgot' && (
            <>
              {!forgotOtpSent ? (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <p className="text-sm text-gray-500 text-center mb-2">Бүртгэлтэй утасны дугаараа оруулна уу</p>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{phoneIcon}</span>
                    <input type="tel" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)}
                      className={inputCls} placeholder="Утасны дугаар" maxLength={12} autoFocus />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-60">
                    {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Илгээж байна...</span> : 'Код авах'}
                  </button>
                  <button type="button" onClick={() => switchTab('login')}
                    className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">← Буцах</button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 text-center">
                    📱 <span className="font-semibold">{forgotPhone}</span>-д код илгээлээ
                  </div>
                  <input type="text" inputMode="numeric" value={forgotOtpCode}
                    onChange={e => setForgotOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    placeholder="──────" maxLength={6} autoFocus />
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{lockIcon}</span>
                    <input type="password" value={forgotNewPw} onChange={e => setForgotNewPw(e.target.value)}
                      className={inputCls} placeholder="Шинэ нууц үг (6+ тэмдэгт)" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{lockIcon}</span>
                    <input type="password" value={forgotConfirmPw} onChange={e => setForgotConfirmPw(e.target.value)}
                      className={inputCls} placeholder="Нууц үг давтах" />
                  </div>
                  <button type="submit" disabled={loading || forgotOtpCode.length !== 6}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50">
                    {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Хадгалж байна...</span> : 'Нууц үг солих'}
                  </button>
                  <button type="button" onClick={() => { setForgotOtpSent(false); setForgotOtpCode(''); setError(''); }}
                    className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">← Буцах</button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
