'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  readCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal,
  type CartItem,
} from '../lib/cartStore';
import { useTenantHref } from '../lib/useTenantHref';
import { useTenant } from '../lib/TenantContext';
import { restoreSession, readAuth, isLoggedIn } from '../lib/authStore';

type PaymentKind = 'qr-bank' | 'qr-app' | 'transfer';

type PaymentMethod = {
  id: string;
  name: string;
  desc: string;
  kind: PaymentKind;
  note?: string;
};

const paymentMethods: PaymentMethod[] = [
  { id: 'qpay', name: 'QPay', desc: 'Та төлбөрөө төлөхөөс өмнө мэдээллээ дахин нягтлана уу.', kind: 'qr-bank' },
  { id: 'digipay', name: 'DiGi Pay', desc: 'Та төлбөрөө төлөхөөс өмнө мэдээллээ дахин нягтлана уу.', kind: 'qr-app' },
  { id: 'monpay', name: 'MonPay', desc: 'Та төлбөрөө төлөхөөс өмнө мэдээллээ дахин нягтлана уу.', kind: 'qr-app' },
  { id: 'storepay', name: 'StorePay', desc: 'Дараа төлөх үйлчилгээ.', kind: 'qr-app', note: 'Таны оруулсан и-мэйл, утасны дугаар StorePay апп дээр бүртгэлтэй байх шаардлагатайг анхаарна уу.' },
  { id: 'toki', name: 'Toki', desc: 'Toki аппликейшнээр төлнө.', kind: 'qr-app', note: 'Таны оруулсан и-мэйл, утасны дугаар Toki апп дээр бүртгэлтэй байх шаардлагатайг анхаарна уу.' },
  { id: 'sono', name: 'SONO', desc: 'SONO аппликейшнээр төлнө.', kind: 'qr-app' },
  { id: 'bank', name: 'Дансаар шилжүүлэх', desc: 'Банкны данс руу шилжүүлэг хийнэ.', kind: 'transfer' },
];

/** Brand logo mark — clean coloured tile + glyph, used instead of emoji. */
function BrandLogo({ id, size = 40 }: { id: string; size?: number }) {
  const wrap = (bg: string, glyph: React.ReactNode) => (
    <span
      className="inline-flex items-center justify-center rounded-xl shrink-0 shadow-sm"
      style={{ width: size, height: size, background: bg }}
    >
      {glyph}
    </span>
  );
  const mono = (ch: string, color = '#fff') => (
    <span style={{ color, fontWeight: 900, fontSize: size * 0.46, lineHeight: 1 }}>{ch}</span>
  );
  const icon = (path: string, stroke = '#fff') => (
    <svg width={size * 0.5} height={size * 0.5} fill="none" stroke={stroke} strokeWidth={2.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
  switch (id) {
    case 'qpay':
      return wrap('#0B1B3A', mono('Q'));
    case 'digipay':
      return wrap('#16A34A', icon('M3 17l6-6 4 4 8-8M21 7v5m0-5h-5'));
    case 'monpay':
      return wrap('linear-gradient(135deg,#7C3AED,#4F46E5)', mono('M'));
    case 'storepay':
      return wrap('#2563EB', icon('M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0'));
    case 'toki':
      return wrap('#F59E0B', mono('t', '#1f2937'));
    case 'sono':
      return wrap('#6D28D9', icon('M4 12l16-8-6 16-2-6-8-2z'));
    case 'bank':
      return wrap('#475569', icon('M3 21h18M5 21V10m4 11V10m6 11V10m4 11V10M12 3l9 5H3l9-5z'));
    default:
      return wrap('#475569', mono(id.charAt(0).toUpperCase()));
  }
}

/** Deterministic QR-style placeholder — looks like a scannable code without a real payload. */
function QrPlaceholder({ seed = 'qpay', size = 168 }: { seed?: string; size?: number }) {
  const n = 21; // QR v1 module grid
  const cell = size / n;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rng = () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return h / 0x7fffffff;
  };
  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, n - 7) || inBox(n - 7, 0);
  };
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (!isFinder(r, c) && rng() > 0.55) cells.push({ r, c });
  const Finder = ({ r, c }: { r: number; c: number }) => (
    <>
      <rect x={c * cell} y={r * cell} width={cell * 7} height={cell * 7} rx={cell} fill="#0f172a" />
      <rect x={(c + 1) * cell} y={(r + 1) * cell} width={cell * 5} height={cell * 5} rx={cell * 0.6} fill="#fff" />
      <rect x={(c + 2) * cell} y={(r + 2) * cell} width={cell * 3} height={cell * 3} rx={cell * 0.4} fill="#0f172a" />
    </>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="#fff" />
      {cells.map(({ r, c }, i) => (
        <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} rx={cell * 0.25} fill="#0f172a" />
      ))}
      <Finder r={0} c={0} />
      <Finder r={0} c={n - 7} />
      <Finder r={n - 7} c={0} />
    </svg>
  );
}

function formatPrice(price: number): string {
  return price.toLocaleString('mn-MN') + '₮';
}

/** Horizontal checkout progress indicator. */
function Stepper({ current }: { current: number }) {
  const steps = ['Сагс', 'Захиалгын мэдээлэл', 'Төлбөрийн мэдээлэл', 'Төлбөр төлөх'];
  return (
    <div className="flex items-center justify-center w-full overflow-x-auto pb-1">
      <div className="flex items-center gap-2 sm:gap-4">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={label} className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors shrink-0 leading-none ${
                    done
                      ? 'bg-primary text-white border-primary'
                      : active
                      ? 'bg-white text-primary border-primary'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
                    done || active ? 'text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && <span className="w-6 sm:w-12 h-px bg-gray-200" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CheckoutClient() {
  const tenantHref = useTenantHref();
  const { tenantId } = useTenant();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(0); // 0 Сагс · 1 Хүргэлт · 2 Төлбөр
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // И-Баримт (receipt)
  const [ebarimtType, setEbarimtType] = useState<'individual' | 'company'>('individual');
  const [ebarimtRegister, setEbarimtRegister] = useState<string>('');

  // QPay real invoice flow
  const [qpayData, setQpayData] = useState<any>(null);
  const [qpayOrderNo, setQpayOrderNo] = useState<string>('');
  const [qpayStatus, setQpayStatus] = useState<'idle' | 'pending' | 'paid'>('idle');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    // DEV-ONLY: skip the login gate so checkout can be previewed without a backend.
    // Enable in the browser console: localStorage.setItem('checkout_preview', '1')
    // Automatically inert in production builds.
    const previewMode =
      process.env.NODE_ENV !== 'production' &&
      typeof window !== 'undefined' &&
      window.localStorage.getItem('checkout_preview') === '1';

    // Restore session from httpOnly cookie, then enforce login
    restoreSession().then(() => {
      if (!isLoggedIn() && !previewMode) {
        router.replace('/account?redirect=/checkout');
        return;
      }
      // Pre-fill form with logged-in user's info
      const user = readAuth();
      if (user) {
        setCustomerInfo((prev) => ({
          ...prev,
          lastName: user.lastName ?? '',
          firstName: user.firstName ?? '',
          phone: user.phone ?? '',
          email: user.email ?? '',
        }));
      }
      setAuthChecked(true);
      setItems(readCart());
    });

    const onCartChange = () => setItems(readCart());
    window.addEventListener('cart:changed', onCartChange);
    return () => window.removeEventListener('cart:changed', onCartChange);
  }, []);

  // Poll QPay payment status while a QPay invoice is pending
  useEffect(() => {
    if (qpayStatus !== 'pending' || !qpayOrderNo || !qpayData) return;
    const check = async () => {
      try {
        const res = await fetch('/api/qpay/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zakhialgiinDugaar: qpayOrderNo }),
        });
        const body = await res.json();
        if (body?.data?.paid) {
          setQpayStatus('paid');
          setSuccessOrderNumber(qpayOrderNo);
          setShowPaymentModal(false);
          setShowSuccessModal(true);
          clearCart();
          setItems([]);
        }
      } catch {
        /* keep polling */
      }
    };
    pollRef.current = setInterval(check, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [qpayStatus, qpayOrderNo, qpayData]);

  const total = useMemo(() => getCartTotal(), [items]);
  const shipping = total >= 500000 ? 0 : 15000;
  const finalTotal = total + shipping;

  // Show spinner while session is being verified
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleQuantityChange = (id: string, delta: number) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    updateQuantity(id, newQty);
    setItems(readCart());
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setItems(readCart());
  };

  const handleClear = () => {
    clearCart();
    setItems([]);
  };

  // Create the order on the backend and return the created order (with orderNumber)
  const createOrder = async () => {
    const orderData = {
      tenantId,
      customerInfo: {
        lastName: customerInfo.lastName,
        firstName: customerInfo.firstName,
        phone: customerInfo.phone,
        email: customerInfo.email,
        address: customerInfo.address,
      },
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMethod: selectedPayment,
      ebarimtType: ebarimtType === 'company' ? 'B2B_RECEIPT' : 'B2C_RECEIPT',
      customerTin: ebarimtType === 'company' ? ebarimtRegister : '',
    };

    const res = await fetch('/api/orders/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Захиалга хийхэд алдаа гарлаа.');
    return body.data;
  };

  const handlePayment = async () => {
    if (!selectedPayment) return;
    setErrorMessage('');
    if (selectedPayment === 'qpay') {
      await startQpay();
    } else {
      setShowPaymentModal(true);
    }
  };

  // Real QPay flow: create order → create invoice → render QR → poll for payment
  const startQpay = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    setQpayData(null);
    setQpayStatus('pending');
    setShowPaymentModal(true);
    try {
      const order = await createOrder();
      setQpayOrderNo(order.orderNumber);
      const res = await fetch(`/api/qpay/invoice?tenantId=${encodeURIComponent(tenantId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zakhialgiinDugaar: order.orderNumber,
          dun: finalTotal,
          tailbar: `Захиалга ${order.orderNumber}`,
        }),
      });
      const body = await res.json();
      if (!res.ok || body.success === false) {
        const msg = body?.error?.message ?? body?.error ?? 'QPay нэхэмжлэл үүсгэхэд алдаа гарлаа.';
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      setQpayData(body.data);
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Алдаа гарлаа.');
      setQpayStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual QPay status check
  const checkQpayNow = async () => {
    if (!qpayOrderNo) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/qpay/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zakhialgiinDugaar: qpayOrderNo }),
      });
      const body = await res.json();
      if (body?.data?.paid) {
        setQpayStatus('paid');
        setSuccessOrderNumber(qpayOrderNo);
        setShowPaymentModal(false);
        setShowSuccessModal(true);
        clearCart();
        setItems([]);
      } else {
        setErrorMessage('Төлбөр хараахан хийгдээгүй байна. Дахин шалгана уу.');
      }
    } catch {
      setErrorMessage('Төлбөр шалгахад алдаа гарлаа.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Non-QPay confirm: create the order and show success
  const processPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const createdOrder = await createOrder();
      setSuccessOrderNumber(createdOrder.orderNumber);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      clearCart();
      setItems([]);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const infoFilled = Boolean(
    customerInfo.lastName && customerInfo.firstName && customerInfo.phone && customerInfo.address,
  );

  // Per-step "can continue" gate
  const canAdvance = step === 0 ? items.length > 0 : step === 1 ? infoFilled : Boolean(selectedPayment);

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-primary">Нүүр</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Сагс</span>
        </nav>
        <h1 className="text-2xl font-black text-gray-800 mb-8">Худалдан авалтын сагс</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-7xl mb-4 opacity-40">🛒</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Таны сагс хоосон байна</h2>
          <p className="text-gray-400 mb-6 text-sm">Барааны жагсаалтаас хүссэн барааг сагсанд нэмнэ үү</p>
          <Link
            href="/s"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Үргэлжлүүлэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Төлбөр төлөх</span>
      </nav>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800">Төлбөр төлөх</h1>
      </div>

      {/* Progress stepper */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 mb-6">
        <Stepper current={step} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* ── LEFT: cart + checkout steps ───────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 0 — Сагс (items only) */}
          {step === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Таны сагс <span className="text-gray-400 font-medium">({items.length})</span></h2>
              {items.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Бүгдийг устгах
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={tenantHref(`/product/${item.slug}`)}
                          className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">{item.brand}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-400 hover:text-primary transition-colors p-1"
                        title="Устгах"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-0.5">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                        {item.oldPrice && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice(item.oldPrice * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Step 1 — Хүргэлтийн мэдээлэл */}
          {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <h2 className="font-bold text-gray-900">Хүргэлтийн мэдээлэл</h2>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Овог"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Нэр"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <input
                type="tel"
                placeholder="Утасны дугаар"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="И-мэйл (заавал биш)"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <textarea
                placeholder="Хүргүүлэх хаяг"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                rows={2}
              />
            </div>
          </div>
          )}

          {/* Step 2 — Төлбөрийн хэлбэр сонгох + И-Баримт */}
          {step === 2 && (
          <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h2 className="font-bold text-gray-900 mb-4">Төлбөрийн хэлбэр сонгох</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const active = selectedPayment === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`relative flex flex-col gap-2.5 p-4 rounded-2xl border text-left transition-all ${
                      active
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BrandLogo id={method.id} size={40} />
                      <span className="font-bold text-gray-900">{method.name}</span>
                      <span
                        className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          active ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}
                      >
                        {active && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${method.note ? 'text-primary/80' : 'text-gray-400'}`}>
                      {method.note ?? method.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* И-Баримт */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h2 className="font-bold text-gray-900 mb-1">И-Баримт</h2>
         
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-3 max-w-xs">
              {([
                ['individual', 'Хувь хүн'],
                ['company', 'Байгууллага'],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setEbarimtType(val)}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                    ebarimtType === val
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {ebarimtType === 'company' && (
              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Байгууллагын регистрийн дугаар</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={7}
                  placeholder="Жишээ: 1234567"
                  value={ebarimtRegister}
                  onChange={(e) => setEbarimtRegister(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm tracking-wide focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>
          </div>
          )}
        </div>

        {/* ── RIGHT: sticky order summary ───────────────────── */}
        <div className="lg:sticky lg:top-6 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Захиалгын дүн</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Барааны үнэ</span>
                <span className="font-medium text-gray-800">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Тоо ширхэг</span>
                <span className="font-medium text-gray-800">{items.reduce((s, i) => s + i.quantity, 0)} ш</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Хүргэлт</span>
                <span className="font-medium text-gray-800">{shipping === 0 ? 'Үнэгүй' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ашигласан урамшуулал</span>
                <span className="font-medium text-gray-800">-0₮</span>
              </div>
              {shipping === 0 ? (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" /></svg>
                  Үнэгүй хүргэлт идэвхжсэн
                </p>
              ) : (
                <p className="text-xs text-gray-400">500,000₮-с дээш захиалгад хүргэлт үнэгүй</p>
              )}
              <div className="border-t border-gray-100 pt-3 mt-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Нийт дүн</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => (step < 2 ? setStep(step + 1) : handlePayment())}
              disabled={!canAdvance}
              className={`w-full mt-5 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                canAdvance
                  ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step < 2 ? 'Үргэлжлүүлэх' : 'Төлбөр төлөх'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="w-full mt-2 py-2.5 rounded-xl font-semibold text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Буцах
              </button>
            )}
            {!canAdvance && (
              <p className="text-center text-xs text-gray-400 mt-2">
                {step === 0 ? 'Сагсанд бараа нэмнэ үү' : step === 1 ? 'Мэдээллээ бүрэн бөглөнө үү' : 'Төлбөрийн хэлбэр сонгоно уу'}
              </p>
            )}
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              SSL хамгаалалт
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              И-Баримт
            </span>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowPaymentModal(false); setQpayStatus('idle'); }} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <button
              onClick={() => { setShowPaymentModal(false); setQpayStatus('idle'); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {(() => {
              const m = paymentMethods.find((p) => p.id === selectedPayment);
              return (
                <div className="flex items-center gap-3 mb-5">
                  <BrandLogo id={selectedPayment} size={44} />
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">{m?.name ?? 'Төлбөр'}</h3>
                    <p className="text-xs text-gray-400">Төлөх дүн: <span className="font-semibold text-gray-700">{formatPrice(finalTotal)}</span></p>
                  </div>
                </div>
              );
            })()}

            {selectedPayment === 'qpay' && (
              <div className="space-y-4">
                {!qpayData && qpayStatus === 'pending' && !errorMessage && (
                  <div className="flex flex-col items-center py-8">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-sm text-gray-500">QPay нэхэмжлэл үүсгэж байна...</p>
                  </div>
                )}

                {qpayData && (
                  <>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col items-center">
                      <div className="bg-white p-3 rounded-xl shadow-sm ring-1 ring-gray-100">
                        {qpayData.qr_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`data:image/png;base64,${qpayData.qr_image}`}
                            alt="QPay QR"
                            className="w-44 h-44 rounded-lg"
                          />
                        ) : (
                          <QrPlaceholder seed={qpayOrderNo} />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-3">{formatPrice(finalTotal)}</p>
                      <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        Банкны апп-аараа QR кодыг уншуулна уу
                      </p>
                    </div>

                    {Array.isArray(qpayData.urls) && qpayData.urls.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Банкны аппликейшнээр төлөх</p>
                        <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto">
                          {qpayData.urls.map((u: any, i: number) => (
                            <a
                              key={i}
                              href={u.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
                              title={u.description ?? u.name}
                            >
                              {u.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.logo} alt={u.name} className="w-8 h-8 rounded-lg object-contain" />
                              ) : (
                                <span className="w-8 h-8 rounded-lg bg-gray-100" />
                              )}
                              <span className="text-[9px] text-gray-600 text-center leading-tight line-clamp-2">{u.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {paymentMethods.find((p) => p.id === selectedPayment)?.kind === 'qr-app' && (
              <div className="space-y-3">
                {paymentMethods.find((p) => p.id === selectedPayment)?.note && (
                  <p className="text-xs text-primary/80 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2 leading-relaxed">
                    {paymentMethods.find((p) => p.id === selectedPayment)?.note}
                  </p>
                )}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm ring-1 ring-gray-100">
                    <QrPlaceholder seed={`${selectedPayment}-${finalTotal}`} />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {paymentMethods.find((p) => p.id === selectedPayment)?.name} аппликейшнээрээ QR кодыг уншуулна уу
                  </p>
                  <p className="text-base font-bold text-gray-900 mt-1">{formatPrice(finalTotal)}</p>
                </div>
              </div>
            )}

            {selectedPayment === 'bank' && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
                {[
                  ['Хүлээн авагч банк', 'Хаан банк'],
                  ['Дансны дугаар', '5xxx xxxx xx'],
                  ['Хүлээн авагч', 'Их Наяд ХХК'],
                  ['Гүйлгээний дүн', formatPrice(finalTotal)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">Гүйлгээний утга дээр утасны дугаараа бичнэ үү.</p>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold text-center leading-normal">
                {errorMessage}
              </div>
            )}

            {selectedPayment === 'qpay' ? (
              <button
                onClick={checkQpayNow}
                disabled={isProcessing || !qpayData}
                className="w-full mt-6 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Шалгаж байна...
                  </>
                ) : (
                  'Төлбөр шалгасан'
                )}
              </button>
            ) : (
              <button
                onClick={processPayment}
                disabled={isProcessing}
                className="w-full mt-6 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Боловсруулж байна...' : 'Төлбөр баталгаажуулах'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Захиалга амжилттай!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Таны захиалгыг хүлээн авлаа. Бид удахгүй тантай холбогдох болно.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500">Захиалгын дугаар</p>
              <p className="font-bold text-gray-900">#{successOrderNumber}</p>
            </div>
            <Link
              href="/"
              onClick={() => setShowSuccessModal(false)}
              className="inline-block w-full py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white transition-colors"
            >
              Нүүр хуудас руу буцах
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
