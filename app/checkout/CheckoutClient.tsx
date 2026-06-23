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
  const { tenantId, shippingFee, shippingFreeThreshold } = useTenant();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string>('');
  const [successOrder, setSuccessOrder] = useState<any>(null);
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

  const fee = typeof shippingFee === 'number' ? shippingFee : 15000;
  const threshold = typeof shippingFreeThreshold === 'number' ? shippingFreeThreshold : 500000;
  const total = useMemo(() => getCartTotal(), [items]);
  const shipping = total >= threshold ? 0 : fee;
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
      setSuccessOrder(body.data);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all">
          <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={() => setShowPaymentModal(false)} />
          <div className={`relative bg-white rounded-3xl shadow-2xl w-full p-6 border border-gray-50/50 transition-all duration-300 transform scale-100 ${
            selectedPayment === 'qpay' && !qpayLoading && qpayInvoice ? 'max-w-2xl' : 'max-w-md'
          }`}>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-all active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-black text-gray-900 mb-5 tracking-tight">Төлбөр баталгаажуулах</h3>

            {selectedPayment === 'qpay' && (
              <div className="space-y-4">
                {qpayLoading && (
                  <div className="flex flex-col items-center py-12 gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-gray-500 animate-pulse">QPay нэхэмжлэх үүсгэж байна...</p>
                  </div>
                )}
                {qpayPaid && (
                  <div className="flex flex-col items-center py-10 gap-3 text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-black text-lg text-green-700">Төлбөр амжилттай!</p>
                    <p className="text-xs text-gray-400 leading-relaxed">Түр хүлээнэ үү, захиалгыг баталгаажуулж байна...</p>
                  </div>
                )}
                {!qpayLoading && !qpayPaid && qpayInvoice && (
                  <div className="grid md:grid-cols-5 gap-6">
                    {/* Left side: QR code */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-5 border border-gray-100/80 shadow-inner">
                      {qpayInvoice.qr_image && (
                        <div className="relative group p-2.5 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center overflow-hidden">
                          {/* Laser scanning line animation */}
                          <div className="absolute top-2 left-2 right-2 h-0.5 bg-primary/75 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-[bounce_2s_infinite]" />
                          <img
                            src={`data:image/png;base64,${qpayInvoice.qr_image}`}
                            alt="QPay QR"
                            className="w-40 h-40 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <p className="text-xs font-bold text-gray-700 mt-4 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                        QR код уншуулах
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 text-center leading-relaxed">
                        Дурын банкны аппликейшн ашиглан уншуулна уу
                      </p>
                    </div>

                    {/* Right side: Bank links */}
                    <div className="md:col-span-3 flex flex-col justify-between min-h-[220px]">
                      <div>
                        <p className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">Аппликейшнээр төлөх:</p>
                        {Array.isArray(qpayInvoice.urls) && qpayInvoice.urls.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-gray-200">
                            {qpayInvoice.urls.map((u: any) => (
                              <a
                                key={u.name}
                                href={u.link}
                                className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-primary hover:bg-red-50/20 active:scale-95 transition-all text-xs font-bold text-gray-700 shadow-sm bg-white"
                              >
                                {u.logo ? (
                                  <img src={u.logo} alt={u.name} className="w-5 h-5 rounded object-cover shadow-sm flex-shrink-0" />
                                ) : (
                                  <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-[10px] flex-shrink-0">🏦</div>
                                )}
                                <span className="truncate">{u.description ?? u.name}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Банкны холбоос олдсонгүй.</p>
                        )}
                      </div>
                      <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-800">
                        <span className="text-gray-500">Төлөх нийт дүн:</span>
                        <span className="text-primary text-base font-black tracking-tight">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
                {!qpayLoading && !qpayInvoice && !errorMessage && (
                  <div className="text-center py-10 text-gray-400 text-sm animate-pulse">QPay бэлтгэж байна...</div>
                )}
              </div>
            )}

            {selectedPayment === 'socialpay' && (
              <div className="text-center py-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                  <span className="text-5xl">📱</span>
                </div>
                <h4 className="font-bold text-gray-800">SocialPay апп-аар төлөх</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Та өөрийн утсанд ирсэн нэхэмжлэхийг баталгаажуулна уу.</p>
                <div className="mt-5 p-3 bg-gray-50 rounded-2xl flex justify-between items-center text-xs font-bold px-4 max-w-[260px] mx-auto">
                  <span className="text-gray-500">Төлөх дүн:</span>
                  <span className="text-primary text-sm font-black">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            )}

            {selectedPayment === 'monpay' && (
              <div className="text-center py-6">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                  <span className="text-5xl">💚</span>
                </div>
                <h4 className="font-bold text-gray-800">MonPay апп-аар төлөх</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Таны MonPay данснаас холбогдох дүн хасагдах болно.</p>
                <div className="mt-5 p-3 bg-gray-50 rounded-2xl flex justify-between items-center text-xs font-bold px-4 max-w-[260px] mx-auto">
                  <span className="text-gray-500">Төлөх дүн:</span>
                  <span className="text-primary text-sm font-black">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            )}

            {selectedPayment === 'cash' && (
              <div className="text-center py-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                  <span className="text-5xl">💵</span>
                </div>
                <h4 className="font-bold text-gray-800">Бэлэн мөнгөөр төлөх</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Бараа хүргэгдэн очих үед бэлнээр төлнө үү.</p>
                <div className="mt-5 p-3 bg-gray-50 rounded-2xl flex justify-between items-center text-xs font-bold px-4 max-w-[260px] mx-auto">
                  <span className="text-gray-500">Төлөх дүн:</span>
                  <span className="text-primary text-sm font-black">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            )}

            {selectedPayment === 'leasing' && (
              <div className="space-y-4 py-2">
                <div>
                  <h4 className="font-bold text-gray-800">Лизинг сонгох</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Төлбөр төлөх хугацаагаа сонгоно уу:</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['3 сар', '6 сар', '12 сар'].map((term) => (
                    <button key={term} className="py-2.5 rounded-xl border border-gray-100 text-xs font-bold hover:border-primary hover:text-primary transition-all bg-white shadow-sm active:scale-95">
                      {term}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 leading-normal bg-gray-50 p-2.5 rounded-xl">
                  ⚠️ Лизингийн дэлгэрэнгүй мэдээлэл болон гэрээ байгуулах удирдамжийг авахыг хүсвэл <strong>7709 1155</strong> дугаарт холбогдоно уу.
                </p>
              </div>
            )}

            {['lendmn', 'pocket'].includes(selectedPayment) && (
              <div className="text-center py-6">
                <h4 className="font-bold text-gray-800 flex items-center justify-center gap-1.5">
                  <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  {paymentMethods.find((p) => p.id === selectedPayment)?.name} холбогдож байна
                </h4>
                <p className="text-xs text-gray-400 mt-1">Түр хүлээнэ үү...</p>
                <div className="w-24 h-24 bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl mx-auto flex items-center justify-center mt-4 shadow-sm animate-pulse">
                  <span className="text-5xl">⏳</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center leading-normal">
                🚨 {errorMessage}
              </div>
            )}

            {selectedPayment !== 'qpay' && (
              <button
                onClick={processPayment}
                disabled={isProcessing}
                className="w-full mt-6 py-3 rounded-2xl font-bold text-sm bg-primary hover:bg-primary-dark text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-98"
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
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center max-h-[95vh] overflow-y-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Захиалга амжилттай!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Таны захиалгыг хүлээн авлаа. Бид удахгүй тантай холбогдох болно.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500">Захиалгын дугаар</p>
              <p className="font-bold text-gray-900">#{successOrderNumber}</p>
            </div>

            {/* Ebarimt Section */}
            {successOrder?.items?.[0]?.ebarimtBillId && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 mb-6 border border-emerald-100/50 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/20 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
                
                <div className="flex justify-between items-center text-xs font-bold text-emerald-800 mb-3 border-b border-emerald-100/40 pb-2">
                  <span className="flex items-center gap-1">🎫 Цахим төлбөрийн баримт</span>
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-sm">E-BARIMT</span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700/80 font-medium">Сугалааны дугаар:</span>
                    <span className="font-black text-emerald-950 tracking-wider text-sm bg-white px-2 py-0.5 rounded-md shadow-sm border border-emerald-100/20">{successOrder.items[0].ebarimtLottery}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700/80 font-medium">Билл-ийн № (DDTD):</span>
                    <span className="font-mono text-[11px] text-emerald-900 font-semibold select-all">{successOrder.items[0].ebarimtBillId}</span>
                  </div>
                </div>

                {successOrder.items[0].ebarimtQrData && (
                  <div className="mt-4 p-3 bg-white rounded-xl flex flex-col items-center justify-center border border-emerald-100/30 shadow-sm transition-all hover:shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(successOrder.items[0].ebarimtQrData)}`}
                      alt="Ebarimt QR"
                      className="w-28 h-28 mix-blend-multiply"
                    />
                    <span className="text-[10px] text-emerald-600 font-semibold mt-2">QR код уншуулах боломжтой</span>
                  </div>
                )}
              </div>
            )}

            <Link
              href="/"
              onClick={() => {
                setShowSuccessModal(false);
                setSuccessOrder(null);
              }}
              className="inline-block w-full py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white transition-colors animate-pulse"
            >
              Нүүр хуудас руу буцах
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
