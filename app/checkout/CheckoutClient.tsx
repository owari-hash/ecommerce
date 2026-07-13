'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const paymentMethods = [
  { id: 'qpay', name: 'QPay', desc: 'Банкны аппаар QR уншуулж төлнө' },
];

/** Branded square logo used instead of emoji. */
function BrandLogo({ id, size = 40 }: { id: string; size?: number }) {
  const map: Record<string, { mono: string; bg: string; fg?: string }> = {
    qpay: { mono: 'Q', bg: '#0B1B3A' },
    cash: { mono: '₮', bg: '#475569' },
  };
  const m = map[id] ?? { mono: id.charAt(0).toUpperCase(), bg: '#475569' };
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl font-black shrink-0 shadow-sm"
      style={{ width: size, height: size, background: m.bg, color: m.fg ?? '#fff', fontSize: size * 0.42 }}
    >
      {m.mono}
    </span>
  );
}

function formatPrice(price: number): string {
  return price.toLocaleString('mn-MN') + '₮';
}

/** Horizontal checkout progress indicator. */
function Stepper({ current }: { current: number }) {
  const steps = ['Сагс', 'Захиалгын мэдээлэл', 'Төлбөр төлөх'];
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
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors shrink-0 leading-none ${done
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
                <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${active ? 'inline' : 'hidden sm:inline'} ${done || active ? 'text-gray-800' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && <span className="w-4 sm:w-12 h-px bg-gray-200 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CheckoutClient() {
  const tenantHref = useTenantHref();
  const { tenantId, shippingFee, shippingFreeThreshold } = useTenant();
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(0); // 0 Сагс · 1 Мэдээлэл · 2 Төлбөр
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string>('');
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // QPay inline flow
  const [qpayInvoice, setQpayInvoice] = useState<any>(null);
  const [qpayLoading, setQpayLoading] = useState(false);
  const [qpayPaid, setQpayPaid] = useState(false);
  const [qpayOrderNum, setQpayOrderNum] = useState<string>('');

  // И-Баримт inline
  const [ebarimtType, setEbarimtType] = useState<'person' | 'org'>('person');
  const [ebarimtTin, setEbarimtTin] = useState<string>('');
  const [ebarimtOrgName, setEbarimtOrgName] = useState<string>('');
  const [ebarimtLoading, setEbarimtLoading] = useState<boolean>(false);

  // Debounce register lookup
  useEffect(() => {
    let t: any = null;
    if (ebarimtType === 'org' && ebarimtTin && ebarimtTin.length === 7) {
      setEbarimtLoading(true);
      t = setTimeout(async () => {
        try {
          const res = await fetch(`/api/ebarimt/resolve?regNo=${encodeURIComponent(ebarimtTin)}`);
          if (!res.ok) return;
          const j = await res.json();
          if (j?.found) {
            if (j.info && j.info.name) {
              setEbarimtOrgName(j.info.name);
            } else {
              setEbarimtOrgName('Байгууллага олдсонгүй');
            }
          } else {
            setEbarimtOrgName('');
          }
        } catch (e) {
          // ignore
        } finally {
          setEbarimtLoading(false);
        }
      }, 700);
    } else {
      setEbarimtOrgName('');
      setEbarimtLoading(false);
    }
    return () => clearTimeout(t);
  }, [ebarimtType, ebarimtTin]);

  const qpayPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopQpayPolling = () => {
    if (qpayPollRef.current) {
      clearInterval(qpayPollRef.current);
      qpayPollRef.current = null;
    }
  };
  useEffect(() => stopQpayPolling, []);

  const [customerInfo, setCustomerInfo] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    restoreSession().then(() => {
      const user = readAuth();
      if (user) {
        setCustomerInfo((prev) => ({
          ...prev,
          lastName: user.lastName ?? '',
          firstName: user.firstName ?? '',
          phone: user.phone ?? '',
        }));
      }
      setAuthChecked(true);
      setItems(readCart());
    });
    const onCartChange = () => setItems(readCart());
    window.addEventListener('cart:changed', onCartChange);
    return () => window.removeEventListener('cart:changed', onCartChange);
  }, []);

  const fee = typeof shippingFee === 'number' ? shippingFee : 15000;
  const threshold = typeof shippingFreeThreshold === 'number' ? shippingFreeThreshold : 500000;
  const total = useMemo(() => getCartTotal(), [items]);
  const shipping = total >= threshold ? 0 : fee;
  const finalTotal = total + shipping;

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
    updateQuantity(id, Math.max(1, item.quantity + delta));
    setItems(readCart());
  };
  const handleRemove = (id: string) => { removeFromCart(id); setItems(readCart()); };
  const handleClear = () => { clearCart(); setItems([]); };

  // Create order on backend; returns created order (with orderNumber, ebarimt fields)
  const processPaymentWithMethod = async (
    method: string,
    orderRef?: string,
    ebType?: 'person' | 'org',
    ebTin?: string,
  ) => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const orderData: any = {
        tenantId,
        customerInfo,
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: method,
        ...(orderRef && { qpayRef: orderRef }),
        ...(ebType && { ebarimtType: ebType === 'org' ? 'B2B_RECEIPT' : 'B2C_RECEIPT' }),
        ...(ebTin && { customerTin: ebTin }),
      };
      const res = await fetch('/api/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Захиалга хийхэд алдаа гарлаа.');
      setSuccessOrderNumber(body.data.orderNumber);
      setSuccessOrder(body.data);
      setShowSuccessModal(true);
      clearCart();
      setItems([]);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // QPay: generate invoice + render banks inline + poll
  const generateQpayInvoice = async () => {
    setQpayLoading(true);
    setQpayInvoice(null);
    setQpayPaid(false);
    setErrorMessage('');
    try {
      const orderNum = `ORD-${Date.now()}`;
      setQpayOrderNum(orderNum);
      const res = await fetch('/api/qpay/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, zakhialgiinDugaar: orderNum, dun: finalTotal, tailbar: `Захиалга ${orderNum}` }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'QPay invoice үүсгэхэд алдаа гарлаа');
      setQpayInvoice(body.data);
      stopQpayPolling();
      qpayPollRef.current = setInterval(async () => {
        try {
          const r = await fetch('/api/qpay/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zakhialgiinDugaar: orderNum }),
          });
          const b = await r.json();
          if (b?.data?.paid) {
            stopQpayPolling();
            setQpayPaid(true);
            await processPaymentWithMethod('qpay', orderNum, ebarimtType, ebarimtTin || undefined);
          }
        } catch { /* keep polling */ }
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setQpayLoading(false);
    }
  };

  // Selecting a payment method. QPay auto-generates its invoice + banks inline.
  const handleSelectPayment = (id: string) => {
    setSelectedPayment(id);
    setErrorMessage('');
    stopQpayPolling();
    setQpayInvoice(null);
    setQpayPaid(false);
    if (id === 'qpay') generateQpayInvoice();
  };

  // Bottom CTA: cash creates order; QPay manual re-check.
  const handleCta = async () => {
    if (step < 2) { setStep(step + 1); return; }
    if (selectedPayment === 'cash') {
      await processPaymentWithMethod('cash', undefined, ebarimtType, ebarimtTin || undefined);
    } else if (selectedPayment === 'qpay' && qpayOrderNum) {
      // manual check
      try {
        const r = await fetch('/api/qpay/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zakhialgiinDugaar: qpayOrderNum }),
        });
        const b = await r.json();
        if (b?.data?.paid) {
          stopQpayPolling();
          setQpayPaid(true);
          await processPaymentWithMethod('qpay', qpayOrderNum, ebarimtType, ebarimtTin || undefined);
        } else {
          setErrorMessage('Төлбөр хараахан хийгдээгүй байна. Дахин шалгана уу.');
        }
      } catch {
        setErrorMessage('Төлбөр шалгахад алдаа гарлаа.');
      }
    }
  };

  const infoFilled = Boolean(
    customerInfo.firstName && customerInfo.phone && customerInfo.address,
  );
  const orgTinOk = ebarimtType !== 'org' || ebarimtTin.trim().length > 0;
  const canAdvance =
    step === 0 ? items.length > 0
      : step === 1 ? infoFilled && orgTinOk
        : Boolean(selectedPayment);

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
          <Link href="/s" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-colors">
            Нүүр хуудас
          </Link>
        </div>
      </div>
    );
  }

  const ctaLabel = step < 2 ? 'Үргэлжлүүлэх' : selectedPayment === 'qpay' ? 'Төлбөр шалгах' : 'Төлбөр төлөх';

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 pb-28 sm:pb-8">
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Төлбөр төлөх</span>
      </nav>
      <h1 className="text-xl sm:text-2xl font-black text-gray-800 mb-4 sm:mb-6">Төлбөр төлөх</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 mb-6">
        <Stepper current={step} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-8 items-start">
        {/* LEFT: steps */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 0 — Сагс */}
          {step === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Бараа ({items.length})</h2>
                {items.length > 0 && (
                  <button onClick={handleClear} className="text-sm text-gray-500 hover:text-primary transition-colors">
                    Бүгдийг устгах
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={tenantHref(`/product/${item.slug}`)} className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-0.5">{item.brand}</p>
                        </div>
                        <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Устгах">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-0.5">
                          <button onClick={() => handleQuantityChange(item.id, -1)} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors">−</button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors">+</button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                          {item.oldPrice && (
                            <div className="text-xs text-gray-400 line-through">{formatPrice(item.oldPrice * item.quantity)}</div>
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div>
                  <h2 className="font-bold text-gray-900 leading-tight">Хүргэлтийн мэдээлэл</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Захиалга хүлээн авах хүний мэдээллийг оруулна уу</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Нэр <span className="text-primary">*</span></label>
                  <input type="text" placeholder="Таны нэр" value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Утасны дугаар <span className="text-primary">*</span></label>
                  <input type="tel" inputMode="numeric" placeholder="99xxxxxx" value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">И-мэйл <span className="text-gray-400 font-normal">(заавал биш)</span></label>
                  <input type="email" placeholder="mail@example.com" value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Хүргүүлэх хаяг <span className="text-primary">*</span></label>
                  <textarea placeholder="Дүүрэг, хороо, байр, тоот, орц/давхар..." value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors" />
                </div>
              </div>

              {/* И-Баримт */}
              <div className="border-t border-gray-100 pt-5 mt-2">
                <h3 className="font-bold text-gray-900 mb-3">И-Баримт</h3>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-3 max-w-xs">
                  {([['person', 'Хувь хүн'], ['org', 'Байгууллага']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setEbarimtType(val)}
                      className={`py-2 rounded-lg text-sm font-semibold transition-all ${ebarimtType === val ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {ebarimtType === 'org' && (
                  <div className="max-w-xs">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Байгууллагын регистрийн дугаар <span className="text-primary">*</span></label>
                    <input type="text" inputMode="numeric" maxLength={7} placeholder="Жишээ: 1234567" value={ebarimtTin}
                      onChange={(e) => setEbarimtTin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm tracking-wide focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    {ebarimtLoading && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Хайж байна...</span>
                      </div>
                    )}
                    {!ebarimtLoading && ebarimtOrgName && (
                      <div className="mt-2 text-xs text-gray-600">Байгууллагын нэр: <span className="font-semibold text-gray-800">{ebarimtOrgName}</span></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2 — Төлбөр + И-Баримт */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <h2 className="font-bold text-gray-900 mb-4">Төлбөрийн хэлбэр</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const active = selectedPayment === method.id;
                    return (
                      <button key={method.id} onClick={() => handleSelectPayment(method.id)}
                        className={`relative flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                        <BrandLogo id={method.id} />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900">{method.name}</span>
                          <span className="block text-xs text-gray-400">{method.desc}</span>
                        </span>
                        <span className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                          {active && (<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* QPay inline: QR + live bank list */}
                {selectedPayment === 'qpay' && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {qpayLoading && (
                      <div className="flex flex-col items-center py-8 gap-3">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">QPay нэхэмжлэл үүсгэж байна...</p>
                      </div>
                    )}
                    {qpayPaid && (
                      <div className="flex flex-col items-center py-8 gap-2 text-center">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="font-bold text-green-700">Төлбөр амжилттай!</p>
                        <p className="text-xs text-gray-400">Захиалгыг баталгаажуулж байна...</p>
                      </div>
                    )}
                    {!qpayLoading && !qpayPaid && qpayInvoice && (
                      <div className="grid md:grid-cols-5 gap-5">
                        <div className="md:col-span-2 flex flex-col items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                          {qpayInvoice.qr_image && (
                            <div className="bg-white p-2.5 rounded-xl shadow-sm ring-1 ring-gray-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`data:image/png;base64,${qpayInvoice.qr_image}`} alt="QPay QR" className="w-40 h-40 object-contain rounded-lg" />
                            </div>
                          )}
                          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-3">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            Банкны аппаар QR уншуулна уу
                          </p>
                          <p className="text-sm font-bold text-primary mt-1">{formatPrice(finalTotal)}</p>
                        </div>
                        <div className="md:col-span-3">
                          <p className="text-xs font-semibold text-gray-500 mb-2">Аппликейшнээр төлөх</p>
                          {Array.isArray(qpayInvoice.urls) && qpayInvoice.urls.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                              {qpayInvoice.urls.map((u: any, i: number) => (
                                <a key={i} href={u.link} target="_blank" rel="noopener noreferrer" title={u.description ?? u.name}
                                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all">
                                  {u.logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={u.logo} alt={u.name} className="w-8 h-8 rounded-lg object-contain" />
                                  ) : (<span className="w-8 h-8 rounded-lg bg-gray-100" />)}
                                  <span className="text-[9px] text-gray-600 text-center leading-tight line-clamp-2">{u.name}</span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Банкны холбоос олдсонгүй.</p>
                          )}
                        </div>
                      </div>
                    )}
                    {!qpayLoading && !qpayInvoice && errorMessage && (
                      <div className="text-center py-4">
                        <button onClick={generateQpayInvoice} className="text-sm font-semibold text-primary hover:underline">Дахин оролдох</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* RIGHT: sticky summary */}
        <div className="lg:sticky lg:top-6 space-y-3 order-first lg:order-last">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Төлбөрийн мэдээлэл</h2>

            
            {items.length > 0 && (
              <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-start justify-between gap-2 text-sm">
                    <span className="text-gray-600 flex-1 min-w-0 truncate">
                      {it.name} <span className="text-gray-400 text-xs">×{it.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-800 whitespace-nowrap">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 pt-3 space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Бүтээгдэхүүний үнэ</span><span className="font-medium text-gray-800">{formatPrice(total)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Хүргэлт</span><span className="font-medium text-gray-800">{shipping === 0 ? 'Үнэгүй' : formatPrice(shipping)}</span></div>
              <p className={`text-xs ${shipping === 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                {threshold.toLocaleString('mn-MN')}₮-с дээш захиалгад хүргэлт үнэгүй
              </p>
              <div className="border-t border-gray-100 pt-3 mt-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Нийт төлөх дүн</span>
                  <span className="text-xl sm:text-2xl font-black text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            {!isLoggedIn() ? (
              <Link href="/account?redirect=/checkout" className="w-full mt-5 py-3.5 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Нэвтэрч захиалах
              </Link>
            ) : (
              <>
                <button onClick={handleCta} disabled={!canAdvance || isProcessing}
                  className={`w-full mt-5 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${canAdvance && !isProcessing ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  {isProcessing ? 'Боловсруулж байна...' : ctaLabel}
                  {!isProcessing && (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>)}
                </button>
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="w-full mt-2 py-2.5 rounded-xl font-semibold text-sm text-gray-500 hover:bg-gray-50 transition-colors">Буцах</button>
                )}
                {!canAdvance && (
                  <p className="text-center text-xs text-gray-400 mt-2">
                    {step === 0 ? 'Сагсанд бараа нэмнэ үү' : step === 1 ? (!infoFilled ? 'Мэдээллээ бүрэн бөглөнө үү' : 'Байгууллагын регистр оруулна уу') : 'Төлбөрийн хэлбэр сонгоно уу'}
                  </p>
                )}
              </>
            )}
            {errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold text-center leading-normal">{errorMessage}</div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal (keeps ebarimt display) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center max-h-[95vh] overflow-y-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Захиалга амжилттай!</h3>
            <p className="text-sm text-gray-600 mb-6">Таны захиалгыг хүлээн авлаа. Бид удахгүй тантай холбогдох болно.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500">Захиалгын дугаар</p>
              <p className="font-bold text-gray-900">#{successOrderNumber}</p>
            </div>
            {successOrder?.items?.[0]?.ebarimtBillId && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 mb-6 border border-emerald-100/50 text-left relative overflow-hidden">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-800 mb-3 border-b border-emerald-100/40 pb-2">
                  <span className="flex items-center gap-1">🎫 Цахим төлбөрийн баримт</span>
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">E-BARIMT</span>
                </div>
                <div className="space-y-2 text-xs">
                  {successOrder.items[0].ebarimtLottery && (
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700/80 font-medium">Сугалааны дугаар:</span>
                      <span className="font-black text-emerald-950 tracking-wider text-sm bg-white px-2 py-0.5 rounded-md">{successOrder.items[0].ebarimtLottery}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700/80 font-medium">Билл-ийн № (DDTD):</span>
                    <span className="font-mono text-[11px] text-emerald-900 font-semibold select-all">{successOrder.items[0].ebarimtBillId}</span>
                  </div>
                </div>
                {successOrder.items[0].ebarimtQrData && (
                  <div className="mt-4 p-3 bg-white rounded-xl flex flex-col items-center border border-emerald-100/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(successOrder.items[0].ebarimtQrData)}`} alt="Ebarimt QR" className="w-28 h-28 mix-blend-multiply" />
                    <span className="text-[10px] text-emerald-600 font-semibold mt-2">QR код уншуулах боломжтой</span>
                  </div>
                )}
              </div>
            )}
            <Link href="/" onClick={() => { setShowSuccessModal(false); setSuccessOrder(null); }}
              className="inline-block w-full py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white transition-colors">
              Нүүр хуудас руу буцах
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
