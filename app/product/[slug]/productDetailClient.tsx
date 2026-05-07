'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toggleCompare } from '../../lib/compareStore';

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    category: string;
    categoryLabel: string;
    icon: string;
    price: string;
    oldPrice?: string;
    props: Array<{ k: string; v: string }>;
  };
};

const paymentOptions = [
  { key: 'sono', label: 'Sono' },
  { key: 'lend', label: 'Lendmn' },
  { key: 'pocket', label: 'Pocket' },
];

export default function ProductDetailClient({ product }: Props) {
  const [tab, setTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [imgIdx, setImgIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState({ scale: 1, rot: 0, flipX: false, flipY: false });

  const images = useMemo(() => {
    // Placeholder “gallery” like Turbotech (thumbs + main)
    return new Array(6).fill(null).map((_, i) => ({
      id: i,
      label: `${product.name} ${i + 1}`,
    }));
  }, [product.name]);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
      if (e.key === 'ArrowRight') setImgIdx((x) => (x + 1) % images.length);
      if (e.key === 'ArrowLeft') setImgIdx((x) => (x - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomOpen, images.length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Images */}
      <section aria-label="images" className="grid grid-cols-6 gap-3">
        <div className="col-span-1 flex flex-col gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setImgIdx(i)}
              className={`rounded-xl border overflow-hidden h-16 bg-gray-50 ${
                i === imgIdx ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={img.label}
            >
              <div className="h-full w-full flex items-center justify-center text-2xl opacity-60">
                {product.icon}
              </div>
            </button>
          ))}
        </div>

        <div className="col-span-5 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden relative">
          <div className="h-[360px] flex items-center justify-center text-8xl opacity-50 select-none">
            {product.icon}
          </div>

          <button
            type="button"
            onClick={() => {
              setZoom({ scale: 1, rot: 0, flipX: false, flipY: false });
              setZoomOpen(true);
            }}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700"
          >
            Zoom view
          </button>

          <div className="absolute left-3 bottom-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setImgIdx((x) => (x - 1 + images.length) % images.length)}
              className="bg-white/90 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setImgIdx((x) => (x + 1) % images.length)}
              className="bg-white/90 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Zoom modal viewer (Turbotech-like controls) */}
      {zoomOpen && (
        <div className="fixed inset-0 z-60">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close zoom"
            onClick={() => setZoomOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-[min(1100px,95vw)] h-[min(720px,90vh)] bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xl relative">
              <div className="absolute top-3 left-3 text-sm font-black text-gray-800">
                {imgIdx + 1} / {images.length}
              </div>
              <button
                type="button"
                className="absolute top-3 right-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:border-gray-300"
                onClick={() => setZoomOpen(false)}
              >
                ✕
              </button>

              <div className="h-full w-full bg-gray-50 flex items-center justify-center select-none">
                <div
                  className="text-[220px] opacity-50"
                  style={{
                    transform: `scale(${zoom.scale}) rotate(${zoom.rot}deg) scaleX(${zoom.flipX ? -1 : 1}) scaleY(${zoom.flipY ? -1 : 1})`,
                    transition: 'transform 120ms ease-out',
                  }}
                >
                  {product.icon}
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-gray-300"
                    onClick={() => setZoom((z) => ({ ...z, flipY: !z.flipY }))}
                  >
                    Flip Y
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-gray-300"
                    onClick={() => setZoom((z) => ({ ...z, flipX: !z.flipX }))}
                  >
                    Flip X
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-gray-300"
                    onClick={() => setZoom((z) => ({ ...z, rot: z.rot - 90 }))}
                  >
                    Rotate left
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-gray-300"
                    onClick={() => setZoom((z) => ({ ...z, rot: z.rot + 90 }))}
                  >
                    Rotate right
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-gray-300"
                    onClick={() => setZoom((z) => ({ ...z, scale: Math.max(0.6, +(z.scale - 0.1).toFixed(2)) }))}
                  >
                    Zoom out
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-gray-300"
                    onClick={() => setZoom((z) => ({ ...z, scale: Math.min(2.2, +(z.scale + 0.1).toFixed(2)) }))}
                  >
                    Zoom in
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-gray-300"
                    onClick={() => setImgIdx((x) => (x - 1 + images.length) % images.length)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-gray-300"
                    onClick={() => setImgIdx((x) => (x + 1) % images.length)}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      <section className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>
            <div className="mt-1 text-sm font-bold text-gray-700">{product.categoryLabel}</div>
            <div className="mt-1 text-xs text-gray-400 font-semibold">#{product.id}</div>
          </div>

          <Link
            href="/brands"
            className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:text-primary hover:border-primary"
          >
            Brand
          </Link>
        </div>

        {/* Rating + Actions */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-gray-300">
            {new Array(5).fill(null).map((_, i) => (
              <span key={i} className="text-lg">
                ★
              </span>
            ))}
            <span className="ml-2 text-sm text-gray-500">(0 сэтгэгдэл)</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300">
              Хадгалах
            </button>
            <button
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300"
              onClick={() => {
                toggleCompare({ id: product.id, title: product.name, slug: product.slug });
              }}
            >
              Харьцуулах
            </button>
            <button className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300">
              Хуваалцах
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-gray-700">
                Үнэ <span className="text-xs text-gray-400 font-semibold">/НӨАТ ороогүй/</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="text-2xl font-black text-gray-900">{product.price}</div>
                {product.oldPrice && (
                  <div className="text-sm text-gray-400 line-through font-semibold">{product.oldPrice}</div>
                )}
              </div>
            </div>
            <button className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-3 rounded-xl text-sm">
              Сагсанд нэмэх
            </button>
          </div>
        </div>

        {/* Properties */}
        <div className="mt-6">
          <h3 className="text-sm font-black text-gray-900 mb-3">Үзүүлэлт</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {product.props.map((x) => (
              <div key={x.k} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2">
                <dt className="text-xs font-bold text-gray-500">{x.k}:</dt>
                <dd className="text-xs font-semibold text-gray-800 text-right">{x.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Payment options */}
        <div className="mt-6">
          <div className="text-sm font-black text-gray-900 mb-3">Төлбөрийн боломжууд</div>
          <div className="flex flex-wrap gap-2">
            {paymentOptions.map((x) => (
              <button
                key={x.key}
                type="button"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:border-gray-300"
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setTab('details')}
              className={`px-3 py-2 text-sm font-bold ${
                tab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
              }`}
            >
              Бүтээгдэхүүний дэлгэрэнгүй
            </button>
            <button
              type="button"
              onClick={() => setTab('specs')}
              className={`px-3 py-2 text-sm font-bold ${
                tab === 'specs' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
              }`}
            >
              Үзүүлэлт
            </button>
            <button
              type="button"
              onClick={() => setTab('reviews')}
              className={`px-3 py-2 text-sm font-bold ${
                tab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
              }`}
            >
              Үнэлгээ, сэтгэгдэл (0)
            </button>
          </div>

          <div className="pt-4">
            {tab === 'details' && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                Тайлбар оруулаагүй байна
              </div>
            )}
            {tab === 'specs' && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                Үзүүлэлт хэсэг (placeholder)
              </div>
            )}
            {tab === 'reviews' && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                Үнэлгээ, сэтгэгдэл одоогоор байхгүй байна
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

