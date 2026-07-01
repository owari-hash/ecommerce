'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '../../lib/TenantContext';
import { ORDER_FLOW, orderStatusMeta, paymentStatusMeta } from '../../lib/orderStatus';

type TrackItem = {
  name: string;
  quantity: number;
  price: number;
  ebarimtBillId?: string;
  ebarimtLottery?: string;
  ebarimtQrData?: string;
};

type TrackOrder = {
  orderNumber: string;
  items: TrackItem[];
  total: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  customerInfo: { firstName: string; address: string };
};

function formatPrice(n: number) {
  return (n ?? 0).toLocaleString('mn-MN') + '₮';
}
function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('mn-MN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

const FLOW_LABELS: Record<string, string> = {
  pending: 'Хүлээгдэж байна',
  processing: 'Боловсруулж байна',
  shipped: 'Хүргэлтэд гарсан',
  delivered: 'Хүргэгдсэн',
};

export default function OrderTrackPage() {
  const params = useParams();
  const orderNumber = decodeURIComponent(String(params.orderNumber ?? ''));
  const { tenantId } = useTenant();
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber || !tenantId) return;
    let active = true;
    setLoading(true);
    setError('');
    fetch(`/api/orders/track/${encodeURIComponent(orderNumber)}?tenantId=${encodeURIComponent(tenantId)}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Захиалга олдсонгүй');
        return body.data as TrackOrder;
      })
      .then((data) => { if (active) setOrder(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderNumber, tenantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4 opacity-40">🔍</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Захиалга олдсонгүй</h1>
        <p className="text-sm text-gray-500 mb-6">{error || `#${orderNumber} дугаартай захиалга олдсонгүй.`}</p>
        <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-colors">
          Нүүр хуудас
        </Link>
      </div>
    );
  }

  const status = orderStatusMeta(order.orderStatus);
  const payment = paymentStatusMeta(order.paymentStatus);
  const cancelled = order.orderStatus === 'cancelled';
  const currentIdx = ORDER_FLOW.indexOf(order.orderStatus as (typeof ORDER_FLOW)[number]);
  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const eb = order.items.find((i) => i.ebarimtBillId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Захиалга хянах</span>
      </nav>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-400">Захиалгын дугаар</p>
            <h1 className="text-xl font-black text-gray-900">#{order.orderNumber}</h1>
            <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: status.color, background: status.bg }}>
              {status.label}
            </span>
            <span className="text-xs font-medium" style={{ color: payment.color }}>{payment.label}</span>
          </div>
        </div>

        {/* Status stepper */}
        {cancelled ? (
          <div className="mt-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center">
            Энэ захиалга цуцлагдсан байна.
          </div>
        ) : (
          <div className="mt-6 flex items-center">
            {ORDER_FLOW.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-colors ${
                      done ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200'
                    }`}>
                      {done ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : (i + 1)}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-semibold text-center leading-tight ${done ? 'text-gray-800' : 'text-gray-400'}`}>
                      {FLOW_LABELS[s]}
                    </span>
                  </div>
                  {i < ORDER_FLOW.length - 1 && (
                    <span className={`flex-1 h-0.5 mx-1 sm:mx-2 -mt-5 ${i < currentIdx ? 'bg-primary' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        {/* Items */}
        <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Захиалсан бараа</h2>
          <div className="divide-y divide-gray-100">
            {order.items.map((it, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{it.name}</p>
                  <p className="text-xs text-gray-400">{it.quantity} × {formatPrice(it.price)}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Барааны дүн</span><span>{formatPrice(itemsTotal)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Хүргэлт</span><span>{order.shippingFee === 0 ? 'Үнэгүй' : formatPrice(order.shippingFee)}</span></div>
            <div className="flex justify-between font-bold text-base pt-1"><span className="text-gray-900">Нийт</span><span className="text-primary">{formatPrice(order.total)}</span></div>
          </div>
        </div>

        {/* Delivery + ebarimt */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Хүргэлт</h2>
            <p className="text-sm text-gray-700 font-medium">{order.customerInfo.firstName}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{order.customerInfo.address}</p>
          </div>

          {eb?.ebarimtBillId && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100/50">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-800 mb-2 border-b border-emerald-100/40 pb-2">
                <span>🎫 И-Баримт</span>
                <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">E-BARIMT</span>
              </div>
              <div className="text-xs flex justify-between items-center mb-2">
                <span className="text-emerald-700/80">Сугалаа:</span>
                <span className="font-black text-emerald-950 bg-white px-2 py-0.5 rounded-md">{eb.ebarimtLottery}</span>
              </div>
              {eb.ebarimtQrData && (
                <div className="p-3 bg-white rounded-xl flex justify-center border border-emerald-100/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(eb.ebarimtQrData)}`} alt="Ebarimt QR" className="w-28 h-28 mix-blend-multiply" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/s" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Худалдан авалтаа үргэлжлүүлэх
        </Link>
      </div>
    </div>
  );
}
