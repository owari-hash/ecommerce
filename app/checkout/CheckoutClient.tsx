'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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

const paymentMethods = [
  { id: 'qpay', name: 'QPay', icon: '💳', color: 'bg-blue-600' },
  { id: 'socialpay', name: 'SocialPay', icon: '📱', color: 'bg-green-600' },
  { id: 'monpay', name: 'MonPay', icon: '💚', color: 'bg-emerald-500' },
  { id: 'lendmn', name: 'LendMN', icon: '🟠', color: 'bg-orange-500' },
  { id: 'pocket', name: 'Pocket', icon: '👛', color: 'bg-purple-500' },
  { id: 'cash', name: 'Бэлэн мөнгө', icon: '💵', color: 'bg-gray-600' },
  { id: 'leasing', name: 'Лизинг', icon: '📋', color: 'bg-primary' },
];

function formatPrice(price: number): string {
  return price.toLocaleString('mn-MN') + '₮';
}

export default function CheckoutClient() {
  const tenantHref = useTenantHref();
  const { tenantId } = useTenant();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [qpayInvoice, setQpayInvoice] = useState<any>(null);
  const [qpayLoading, setQpayLoading] = useState(false);
  const [qpayPaid, setQpayPaid] = useState(false);
  const [qpayOrderNum, setQpayOrderNum] = useState<string>('');

  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    // Restore session from httpOnly cookie, then enforce login
    restoreSession().then(() => {
      if (!isLoggedIn()) {
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

  const handlePayment = async () => {
    if (!selectedPayment) return;
    setShowPaymentModal(true);
    if (selectedPayment === 'qpay') {
      await generateQpayInvoice();
    }
  };

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
      // Poll every 3s
      const interval = setInterval(async () => {
        const r = await fetch('/api/qpay/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zakhialgiinDugaar: orderNum }),
        });
        const b = await r.json();
        if (b?.data?.paid) {
          clearInterval(interval);
          setQpayPaid(true);
          await processPaymentWithMethod('qpay', orderNum);
        }
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setQpayLoading(false);
    }
  };

  const processPaymentWithMethod = async (method: string, orderRef?: string) => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const orderData = {
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
      };
      const res = await fetch('/api/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Захиалга хийхэд алдаа гарлаа.');
      setSuccessOrderNumber(body.data.orderNumber);
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

  const processPayment = () => processPaymentWithMethod(selectedPayment);

  const isFormValid =
    customerInfo.lastName &&
    customerInfo.firstName &&
    customerInfo.phone &&
    customerInfo.address &&
    selectedPayment;

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
            Дэлгүүрлэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Сагс</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Худалдан авалтын сагс</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Бараа ({items.length})</h2>
              {items.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
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
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Устгах"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
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

          {/* Continue Shopping */}
          <Link
            href="/s"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Худалдан авалтаа үргэлжлүүлэх
          </Link>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-4">Хүргэлтын мэдээлэл</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Овог"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Нэр"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <input
                type="tel"
                placeholder="Утасны дугаар"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
              <input
                type="email"
                placeholder="И-мэйл (заавал биш)"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
              <textarea
                placeholder="Хүргүүлэх хаяг"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-4">Төлбөрийн хэрэгсэл</h2>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedPayment === method.id
                      ? 'border-primary bg-red-50 ring-1 ring-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-4">Захиалгын мэдээлэл</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Бараа ({items.reduce((s, i) => s + i.quantity, 0)}ш)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Хүргэлт</span>
                <span>{shipping === 0 ? 'Үнэгүй' : formatPrice(shipping)}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600">500,000₮-с дээш захиалга хүргэлт үнэгүй</p>
              )}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">Нийт төлбөр</span>
                  <span className="text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={!isFormValid}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all ${
                isFormValid
                  ? 'bg-primary hover:bg-primary-dark text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Төлбөр төлөх
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Төлбөр баталгаажуулах</h3>

            {selectedPayment === 'qpay' && (
              <div className="space-y-4">
                {qpayLoading && (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">QPay invoice үүсгэж байна...</p>
                  </div>
                )}
                {qpayPaid && (
                  <div className="flex flex-col items-center py-6 gap-2">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-bold text-green-700">Төлбөр амжилттай!</p>
                  </div>
                )}
                {!qpayLoading && !qpayPaid && qpayInvoice && (
                  <>
                    {/* QR image */}
                    {qpayInvoice.qr_image && (
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-3">QR уншуулж төлнө үү</p>
                        <img
                          src={`data:image/png;base64,${qpayInvoice.qr_image}`}
                          alt="QPay QR"
                          className="w-44 h-44 mx-auto rounded-xl"
                        />
                        <p className="text-xs text-gray-400 mt-2 animate-pulse">Төлбөр хүлээж байна...</p>
                      </div>
                    )}
                    {/* Deep links */}
                    {Array.isArray(qpayInvoice.urls) && qpayInvoice.urls.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Эсвэл банкны аппаа нээнэ үү:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {qpayInvoice.urls.map((u: any) => (
                            <a
                              key={u.name}
                              href={u.link}
                              className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 hover:border-primary hover:bg-red-50 transition-all text-sm font-medium"
                            >
                              {u.logo && <img src={u.logo} alt={u.name} className="w-6 h-6 rounded" />}
                              <span>{u.description ?? u.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {!qpayLoading && !qpayInvoice && !errorMessage && (
                  <div className="text-center py-6 text-gray-400 text-sm">QPay бэлтгэж байна...</div>
                )}
              </div>
            )}

            {selectedPayment === 'socialpay' && (
              <div className="text-center py-4">
                <div className="w-40 h-40 bg-green-100 rounded-xl mx-auto flex items-center justify-center mb-4">
                  <span className="text-6xl">📱</span>
                </div>
                <p className="text-sm text-gray-600">SocialPay апп-аар төлнө үү</p>
                <p className="text-lg font-bold text-gray-900 mt-2">{formatPrice(finalTotal)}</p>
              </div>
            )}

            {selectedPayment === 'monpay' && (
              <div className="text-center py-4">
                <div className="w-40 h-40 bg-emerald-100 rounded-xl mx-auto flex items-center justify-center mb-4">
                  <span className="text-6xl">💚</span>
                </div>
                <p className="text-sm text-gray-600">MonPay апп-аар төлнө үү</p>
                <p className="text-lg font-bold text-gray-900 mt-2">{formatPrice(finalTotal)}</p>
              </div>
            )}

            {selectedPayment === 'cash' && (
              <div className="text-center py-4">
                <div className="w-40 h-40 bg-gray-100 rounded-xl mx-auto flex items-center justify-center mb-4">
                  <span className="text-6xl">💵</span>
                </div>
                <p className="text-sm text-gray-600">Хүргэгч бэлэн мөнгө хүлээн авана</p>
                <p className="text-lg font-bold text-gray-900 mt-2">{formatPrice(finalTotal)}</p>
              </div>
            )}

            {selectedPayment === 'leasing' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Лизингийн хугацаа:</p>
                <div className="grid grid-cols-3 gap-2">
                  {['3 сар', '6 сар', '12 сар'].map((term) => (
                    <button key={term} className="p-2 rounded-xl border border-gray-200 text-sm font-medium hover:border-primary">
                      {term}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Лизингийн дэлгэрэнгүй мэдээлэл авахыг хүсвэл 7709 1155 дугаарт холбогдоно уу</p>
              </div>
            )}

            {['lendmn', 'pocket'].includes(selectedPayment) && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">{paymentMethods.find((p) => p.id === selectedPayment)?.name} холбогдож байна...</p>
                <div className="w-40 h-40 bg-gray-100 rounded-xl mx-auto flex items-center justify-center mt-4">
                  <span className="text-6xl">⏳</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold text-center leading-normal">
                {errorMessage}
              </div>
            )}

            {selectedPayment !== 'qpay' && (
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
