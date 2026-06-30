# Storefront Polish, Step-Based Checkout & Live QPay Banks — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert checkout into a 3-step wizard with QPay+cash only and inline live QPay banks, then polish every storefront page for a consistent, responsive, deploy-ready look.

**Architecture:** Single-file checkout client refactor (`CheckoutClient.tsx`) merging main's working order/QPay/ebarimt logic with preview-stores' step UI. Storefront sweep is a series of per-component visual/responsive edits using existing Tailwind `primary` tokens. No backend, data-model, or API-route changes.

**Tech Stack:** Next.js (App Router — see `node_modules/next/dist/docs/` before unfamiliar APIs), React client components, Tailwind CSS with tenant-injected `--color-primary` tokens, lucide-react icons.

## Global Constraints

- **Color is tenant-driven.** Use only `primary` / `primary-dark` / `primary-light` Tailwind tokens. NEVER hardcode `red-*`, `orange-*`, or literal brand hex in the storefront. turbotech.mn is a layout/feel reference, not a palette.
- **Responsive at 375px / 768px / 1440px** for every touched screen.
- **QPay is a real backend integration.** Do not change `app/api/qpay/invoice/route.ts`, `app/api/qpay/check/route.ts`, or `app/api/orders/public` payload shapes. Only presentation + when fetches fire may change.
- **No test framework exists.** The per-task "test cycle" is: `npx tsc --noEmit` (typecheck) + `npm run lint` + visual check via Playwright at the 3 widths. Dev server runs at `http://localhost:7000` (`npm run dev`).
- Mongolian UI copy throughout; keep existing strings unless a task says otherwise.
- Order payload field names (verbatim, from existing code): `tenantId`, `customerInfo`, `items[].{productId,name,quantity,price}`, `paymentMethod`, `qpayRef`, `ebarimtType` (`'B2B_RECEIPT'|'B2C_RECEIPT'`), `customerTin`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `app/checkout/CheckoutClient.tsx` | **Rewrite** — 3-step wizard, QPay+cash, inline live QPay banks, ebarimt inline, success modal w/ ebarimt QR |
| `app/components/ProductCard.tsx` | Polish — badge red→primary, price/discount treatment |
| `app/sections/CategoryList.tsx` | Polish + responsive grid |
| `app/sections/HeroBanner.tsx` | Polish + responsive |
| `app/sections/ProductGrid.tsx` | Polish + responsive grid density |
| `app/sections/GroceryBento.tsx` | Polish + responsive |
| `app/components/Header.tsx`, `MegaMenu.tsx`, `MobileBottomNav.tsx` | Polish + responsive nav |
| `app/components/Footer.tsx` | Rebuild — multi-column responsive |
| `app/[...slug]/listingClient.tsx`, `app/search/SearchClient.tsx` | Polish + responsive |
| `app/product/[slug]/productDetailClient.tsx` | Polish + responsive |
| `app/account/AccountClient.tsx` | Polish + responsive |

---

## Task 1: Checkout — 3-step wizard with QPay+cash and inline live banks

**Files:**
- Modify (full rewrite): `app/checkout/CheckoutClient.tsx`

**Interfaces:**
- Consumes (existing, unchanged): `../lib/cartStore` (`readCart, removeFromCart, updateQuantity, clearCart, getCartTotal, CartItem`); `../lib/useTenantHref`; `../lib/TenantContext` (`useTenant` → `tenantId, shippingFee, shippingFreeThreshold`); `../lib/authStore` (`restoreSession, readAuth, isLoggedIn`); routes `/api/qpay/invoice`, `/api/qpay/check`, `/api/orders/public`.
- Produces: default-exported `CheckoutClient` React component. No exported symbols consumed elsewhere.

**Design decisions (resolve spec ambiguity):**
- Ebarimt is collected **inline in Step 2** (replaces main's separate ebarimt picker modal). The picker modal is removed; its data (`ebarimtType`, `ebarimtTin`) is gathered inline and passed into order creation.
- 3 steps: `['Сагс', 'Захиалгын мэдээлэл', 'Төлбөр төлөх']`.
- Payment methods: **`qpay`** and **`cash`** only.
- QPay: selecting it in Step 2 auto-generates the invoice and renders QR + the real returned `urls` (bank list) **inline** in Step 2 (no modal). 3s polling preserved; on `paid` → create order (`qpayRef` + inline ebarimt) → success modal.
- Cash: bottom button creates the order directly → success modal.
- Success modal keeps main's full ebarimt display (lottery / bill / QR).

- [ ] **Step 1: Read both reference files**

Read the current `app/checkout/CheckoutClient.tsx` (main logic) and confirm the helper functions (`BrandLogo`, `formatPrice`, `Stepper`) and the order/QPay/ebarimt logic. This task replaces the file's body but reuses these.

- [ ] **Step 2: Replace the file with the merged wizard**

Write `app/checkout/CheckoutClient.tsx` with exactly this content:

```tsx
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
  { id: 'cash', name: 'Бэлэн мөнгө', desc: 'Хүлээж авах үед төлнө' },
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
                <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${done || active ? 'text-gray-800' : 'text-gray-400'}`}>
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
    customerInfo.lastName && customerInfo.firstName && customerInfo.phone && customerInfo.address,
  );
  const orgTinOk = ebarimtType !== 'org' || ebarimtTin.trim().length > 0;
  const canAdvance =
    step === 0 ? items.length > 0
    : step === 1 ? infoFilled
    : Boolean(selectedPayment) && orgTinOk;

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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 mb-4">Хүргэлтийн мэдээлэл</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Овог" value={customerInfo.lastName} onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                  <input type="text" placeholder="Нэр" value={customerInfo.firstName} onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <input type="tel" placeholder="Утасны дугаар" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                <input type="email" placeholder="И-мэйл (заавал биш)" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                <textarea placeholder="Хүргүүлэх хаяг" value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" rows={2} />
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

              {/* И-Баримт inline */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <h2 className="font-bold text-gray-900 mb-3">И-Баримт</h2>
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
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Байгууллагын регистрийн дугаар</label>
                    <input type="text" inputMode="numeric" maxLength={7} placeholder="Жишээ: 1234567" value={ebarimtTin}
                      onChange={(e) => setEbarimtTin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm tracking-wide focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: sticky summary */}
        <div className="lg:sticky lg:top-6 space-y-3 order-first lg:order-last">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Захиалгын дүн</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Бараа ({items.reduce((s, i) => s + i.quantity, 0)}ш)</span><span className="font-medium text-gray-800">{formatPrice(total)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Хүргэлт</span><span className="font-medium text-gray-800">{shipping === 0 ? 'Үнэгүй' : formatPrice(shipping)}</span></div>
              {shipping === 0 ? (
                <p className="text-xs text-emerald-600">{threshold.toLocaleString('mn-MN')}₮-с дээш захиалгад хүргэлт үнэгүй</p>
              ) : (
                <p className="text-xs text-gray-400">{threshold.toLocaleString('mn-MN')}₮-с дээш захиалгад хүргэлт үнэгүй</p>
              )}
              <div className="border-t border-gray-100 pt-3 mt-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Нийт дүн</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(finalTotal)}</span>
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
                    {step === 0 ? 'Сагсанд бараа нэмнэ үү' : step === 1 ? 'Мэдээллээ бүрэн бөглөнө үү' : !selectedPayment ? 'Төлбөрийн хэлбэр сонгоно уу' : 'Байгууллагын регистр оруулна уу'}
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
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700/80 font-medium">Сугалааны дугаар:</span>
                    <span className="font-black text-emerald-950 tracking-wider text-sm bg-white px-2 py-0.5 rounded-md">{successOrder.items[0].ebarimtLottery}</span>
                  </div>
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
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `app/checkout/CheckoutClient.tsx`. (Confirmed: `CartItem` has `icon` but no `image`, so the cart row renders `item.icon` only.)

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no new errors for the checkout file.

- [ ] **Step 5: Visual verification (Playwright)**

With `npm run dev` running (port 7000): navigate to `/checkout` with items in cart. At widths 1440 / 768 / 375 verify: stepper renders 3 steps; Step 0 cart, Step 1 form, Step 2 payment; selecting QPay shows loading then QR + bank list inline (or graceful error + retry if backend offline); selecting Бэлэн мөнгө enables "Төлбөр төлөх"; Буцах works; org ebarimt requires register number. Screenshot each width. Check console for errors.

- [ ] **Step 6: Commit**

```bash
git add app/checkout/CheckoutClient.tsx
git commit -m "feat(checkout): 3-step wizard, QPay+cash only, inline live QPay banks"
```

---

## Task 2: ProductCard — fix hardcoded red, polish price/discount

**Files:**
- Modify: `app/components/ProductCard.tsx`

**Interfaces:**
- Consumes: existing `Props` (unchanged). Produces: same default-exported `ProductCard` (no signature change).

- [ ] **Step 1: Fix the discount badge color**

In `app/components/ProductCard.tsx`, the discount badge uses `bg-red-500` (~line 97). Replace `bg-red-500` with `bg-primary`. This is the only hardcoded color and a Global-Constraint violation.

```tsx
// before:
<span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none shadow">
// after:
<span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none shadow">
```

- [ ] **Step 2: Tighten price/discount row (turbotech-style density)**

Read the info block (~lines 124-141). Keep current price + old-price, and ensure the discount % is legible. Leave the structure; only confirm spacing classes use the shared rhythm (`gap-1.5`, `mt-1.5`). No functional change. If price/old-price already match, no edit needed here.

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 4: Visual verification**

On `/` and a category listing, at 375 / 768 / 1440: confirm badge now uses tenant primary color (not literal red), cards align in a clean grid, hover lift works. Screenshot.

- [ ] **Step 5: Commit**

```bash
git add app/components/ProductCard.tsx
git commit -m "fix(product-card): tenant primary discount badge, tighten price row"
```

---

## Task 3: CategoryList — responsive polish

**Files:**
- Modify: `app/sections/CategoryList.tsx`

- [ ] **Step 1: Verify responsive grid + tokens**

Read `app/sections/CategoryList.tsx`. The grid is `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`. Confirm it renders cleanly at 375 (2 cols), 768 (3), 1440 (4). Keep the dark-tile gradient (it's a decorative neutral, not a brand color — allowed). Ensure the "Бүгдийг харах" link uses `text-primary` (it does) and hover uses `primary` tokens. No structural rewrite; only adjust spacing/breakpoints if a width looks cramped (e.g., reduce `auto-rows` height on mobile if tiles overflow).

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Visual verification**

Load `/` at 3 widths; screenshot the category section. Confirm no overflow, even gaps, readable labels.

- [ ] **Step 4: Commit**

```bash
git add app/sections/CategoryList.tsx
git commit -m "polish(category-list): responsive spacing pass"
```

---

## Task 4: HeroBanner — responsive polish

**Files:**
- Modify: `app/sections/HeroBanner.tsx`

- [ ] **Step 1: Read and align**

Read `app/sections/HeroBanner.tsx`. Ensure: container uses `max-w-7xl mx-auto px-4`; banner height scales down on mobile (no fixed desktop height causing overflow at 375); any CTA/button uses `bg-primary hover:bg-primary-dark`; no hardcoded red/orange. Apply concrete fixes only where a width breaks.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Visual verification**

Load `/` at 3 widths; screenshot hero. Confirm image/text fit, CTA visible, no horizontal scroll.

- [ ] **Step 4: Commit**

```bash
git add app/sections/HeroBanner.tsx
git commit -m "polish(hero): responsive sizing + primary tokens"
```

---

## Task 5: ProductGrid + GroceryBento — grid density + tokens

**Files:**
- Modify: `app/sections/ProductGrid.tsx`
- Modify: `app/sections/GroceryBento.tsx`

- [ ] **Step 1: ProductGrid**

Read `app/sections/ProductGrid.tsx`. Confirm grid columns scale (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` or similar, matching ProductCard sizes), consistent `gap-3 sm:gap-4`, section heading uses shared typography (`text-xl font-black`), "see all" link uses `text-primary`. Loading skeletons present. Fix any hardcoded color.

- [ ] **Step 2: GroceryBento**

Read `app/sections/GroceryBento.tsx`. Ensure bento tiles reflow at mobile (stack/2-col) and use `primary` tokens. Fix overflow.

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 4: Visual verification**

Load `/` at 3 widths; screenshot both sections. Confirm density + reflow.

- [ ] **Step 5: Commit**

```bash
git add app/sections/ProductGrid.tsx app/sections/GroceryBento.tsx
git commit -m "polish(home-sections): grid density + responsive reflow"
```

---

## Task 6: Header + MegaMenu + MobileBottomNav

**Files:**
- Modify: `app/components/Header.tsx`
- Modify: `app/components/MegaMenu.tsx`
- Modify: `app/components/MobileBottomNav.tsx`

- [ ] **Step 1: Header**

Read `app/components/Header.tsx`. Target turbotech-style top bar: logo left, search center (collapses to icon/row on mobile), cart + account icons right. Ensure no hardcoded red/orange; active/hover use `primary`. Confirm it doesn't overflow at 375 (search may wrap to its own row).

- [ ] **Step 2: MegaMenu**

Read `app/components/MegaMenu.tsx`. Desktop: horizontal category dropdown. Mobile: ensure it's hidden/replaced by a drawer or the bottom nav (no broken desktop menu at 375). Tokens only.

- [ ] **Step 3: MobileBottomNav**

Read `app/components/MobileBottomNav.tsx`. Confirm it shows only `< lg`, has Home/Categories/Cart/Account, active item uses `text-primary`, sits above content (`z-40+`), and the checkout page bottom padding (`pb-28 sm:pb-8`, added in Task 1) clears it.

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 5: Visual verification**

At 3 widths on `/`: screenshot header, open mega-menu (desktop), confirm bottom nav (mobile). No overflow, tokens correct.

- [ ] **Step 6: Commit**

```bash
git add app/components/Header.tsx app/components/MegaMenu.tsx app/components/MobileBottomNav.tsx
git commit -m "polish(nav): responsive header, mega-menu, bottom nav"
```

---

## Task 7: Footer — multi-column responsive rebuild

**Files:**
- Modify: `app/components/Footer.tsx`

- [ ] **Step 1: Rebuild structure**

Read `app/components/Footer.tsx`. Implement a comprehensive footer with columns: **Компани** (about/news), **Тусламж** (terms/privacy/refund), **Брэндүүд**, **Лизинг**, **Холбоо барих** (phone/email/address). Grid: `grid-cols-2 md:grid-cols-4 lg:grid-cols-5` with `gap-8`, stacking to 2 columns at mobile. Bottom strip: copyright + payment/social icons. Use `primary` for link hovers; neutral dark/gray surface is fine (not a brand color). Keep existing links/data where present; do not invent contact details — reuse whatever the current footer already contains.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Visual verification**

At 3 widths: screenshot footer. Confirm columns reflow 2→4→5, links readable, no overflow.

- [ ] **Step 4: Commit**

```bash
git add app/components/Footer.tsx
git commit -m "polish(footer): multi-column responsive layout"
```

---

## Task 8: Listing + Search pages

**Files:**
- Modify: `app/[...slug]/listingClient.tsx`
- Modify: `app/search/SearchClient.tsx`

- [ ] **Step 1: Listing**

Read `app/[...slug]/listingClient.tsx`. Ensure: product grid matches ProductGrid density/breakpoints; filters/sort bar usable at mobile (stack or collapse); designed empty state ("Илэрц олдсонгүй") and loading skeletons; `primary` tokens only.

- [ ] **Step 2: Search**

Read `app/search/SearchClient.tsx`. Same grid + empty/loading treatment; query echo + result count; responsive.

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 4: Visual verification**

Load a category listing and a search at 3 widths; screenshot. Confirm grid, filters, empty state.

- [ ] **Step 5: Commit**

```bash
git add app/[...slug]/listingClient.tsx app/search/SearchClient.tsx
git commit -m "polish(listing,search): responsive grid + states"
```

---

## Task 9: Product detail

**Files:**
- Modify: `app/product/[slug]/productDetailClient.tsx`

- [ ] **Step 1: Polish**

Read `app/product/[slug]/productDetailClient.tsx`. Target: gallery + info two-column on desktop, stacked on mobile; price/old-price/discount consistent with ProductCard; add-to-cart + buy buttons use `bg-primary`; specs/description in clean cards; sticky add-to-cart bar on mobile if present. Tokens only; fix any hardcoded color.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Visual verification**

Load a product at 3 widths; screenshot. Confirm layout stacks, CTAs visible, price treatment consistent.

- [ ] **Step 4: Commit**

```bash
git add app/product/[slug]/productDetailClient.tsx
git commit -m "polish(product-detail): responsive layout + primary CTAs"
```

---

## Task 10: Account

**Files:**
- Modify: `app/account/AccountClient.tsx`

- [ ] **Step 1: Polish**

Read `app/account/AccountClient.tsx`. Ensure auth forms (login/OTP/register/forgot) and the logged-in dashboard use the shared input style (`rounded-xl`, `focus:border-primary focus:ring-1 focus:ring-primary`), one button system, and are centered/responsive at mobile. Designed loading + error states. Tokens only.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Visual verification**

Load `/account` at 3 widths; screenshot the auth view (and dashboard if reachable). Confirm inputs/buttons consistent, responsive.

- [ ] **Step 4: Commit**

```bash
git add app/account/AccountClient.tsx
git commit -m "polish(account): unified inputs/buttons, responsive"
```

---

## Task 11: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: typecheck clean, lint clean, build succeeds.

- [ ] **Step 2: Cross-page responsive pass**

With `npm run dev`: walk `/`, a category listing, a product, `/search?q=...`, `/account`, `/checkout` (with items) at 1440 / 768 / 375. Screenshot each. Confirm: no horizontal scroll, consistent cards/buttons/inputs, designed empty/loading states, bottom nav clears content on mobile.

- [ ] **Step 3: Token audit**

Run: `grep -rnE "red-[0-9]|orange-[0-9]" app --include=*.tsx` (the checkout success/error modal intentionally keeps `red-*` for error states — those are status colors, acceptable). Confirm no brand-color usage crept into the polish (badges, buttons, accents must be `primary`).

Run (from repo root via Bash): expected output limited to error-state `red-*` (e.g. `bg-red-50`, `text-red-600` in modals).

- [ ] **Step 4: Console check**

On each page at desktop width, confirm browser console has no runtime errors (QPay backend-offline fetch errors during local dev are acceptable and handled with the retry UI).

- [ ] **Step 5: Commit any final fixes**

```bash
git add -A
git commit -m "polish: final responsive + token audit fixes"
```

---

## Self-Review Notes

- **Spec coverage:** Checkout wizard (Task 1) ✓; QPay+cash only (Task 1) ✓; inline live QPay banks (Task 1) ✓; ebarimt inline + success ebarimt display (Task 1) ✓; tenant shipping/threshold (Task 1) ✓; ProductCard red→primary (Task 2) ✓; home sections (Tasks 3-5) ✓; nav (Task 6) ✓; footer (Task 7) ✓; listing/search (Task 8) ✓; product detail (Task 9) ✓; account (Task 10) ✓; responsive 375/768/1440 + token audit (Task 11) ✓.
- **Spec deviation (intentional):** the standalone И-Баримт *picker modal* from main is replaced by an inline ebarimt block in Step 2 (collected before payment), passed into order creation. Success modal still shows the returned ebarimt QR/lottery/bill. This is the better fit for a wizard and matches the approved Step-2 design.
- **Status-color note:** error/success modals retain `red-*`/`green-*` as semantic status colors (not brand). Allowed by the token audit in Task 11.
- **CartItem rendering:** confirmed `CartItem` has `icon` (no `image`); cart rows render `item.icon`.
- **QPay order timing:** kept main's pattern — client-generated `ORD-${Date.now()}` for invoice/check, real order created via `/api/orders/public` only after `paid` (with `qpayRef` + ebarimt). This preserves the working backend contract; the order number shown in success is the backend's `orderNumber`, while QPay polling keys off the client ref. If your backend instead requires the DB order to exist before invoicing, switch to preview-stores' "create order first" sequence — flagged here as the one integration assumption to confirm during Task 1 Step 5.
```
