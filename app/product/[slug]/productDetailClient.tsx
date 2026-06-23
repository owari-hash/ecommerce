'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toggleCompare, readCompare } from '../../lib/compareStore';
import { addToCart } from '../../lib/cartStore';
import { Lens } from '../../components/Lens';
import { useTenant } from '../../lib/TenantContext';

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    description?: string;
    brand: string;
    category: string;
    categoryLabel: string;
    icon: string;
    image?: string;
    images?: string[];
    price: string;
    oldPrice?: string;
    props: Array<{ k: string; v: string }>;
    stock?: number;
    isPosLinked?: boolean;
  };
};

const paymentOptions = [
  { key: 'qpay', label: 'QPay' },
  { key: 'socialpay', label: 'SocialPay' },
  { key: 'monpay', label: 'MonPay' },
  { key: 'lendmn', label: 'LendMN' },
  { key: 'pocket', label: 'Pocket' },
  { key: 'cash', label: 'Бэлэн мөнгө' },
];

function parsePrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
}

function isUrl(s: string) {
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')
}

function getApiUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return 'http://localhost:8000';
}

function resolveProductImageUrl(url: string | undefined) {
  if (!url) return '';
  const apiUrl = getApiUrl();
  const uploadMatch = url.match(/\/upload\/(.+)$/);
  if (uploadMatch) {
    return `${apiUrl}/upload/${uploadMatch[1]}`;
  }
  if (isUrl(url)) return url;
  return url.startsWith('/') ? `${apiUrl}${url}` : `${apiUrl}/upload/${url}`;
}

export default function ProductDetailClient({ product }: Props) {
  const { branding } = useTenant();
  const [tab, setTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [imgIdx, setImgIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState({ scale: 1, rot: 0, flipX: false, flipY: false });
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    const update = () => setInCompare(readCompare().some((x) => x.id === product.id));
    update();
    window.addEventListener('compare:changed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('compare:changed', update);
      window.removeEventListener('storage', update);
    };
  }, [product.id]);

  const logoFallback = resolveProductImageUrl(branding.logo);

  const images = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images.map((imgUrl, i) => ({
        id: `img-${i}`,
        src: resolveProductImageUrl(imgUrl),
        alt: `${product.name} - ${i + 1}`,
        label: `View ${i + 1}`,
        isImage: true,
        isLogo: false,
      }));
    }
    if (product.image) {
      return [{
        id: 'img-0',
        src: resolveProductImageUrl(product.image),
        alt: product.name,
        label: 'View 1',
        isImage: true,
        isLogo: false,
      }];
    }
    // No product image — fall back to tenant logo
    if (logoFallback) {
      return [{
        id: 'img-logo',
        src: logoFallback,
        alt: branding.name ?? 'Logo',
        label: 'Logo',
        isImage: true,
        isLogo: true,
      }];
    }
    // Last resort: emoji icon
    return [{
      id: 'img-0',
      src: '',
      alt: product.name,
      label: 'View 1',
      isImage: false,
      isLogo: false,
    }];
  }, [product.images, product.image, product.name, logoFallback, branding.name]);

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

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    const price = parsePrice(product.price);
    const oldPrice = product.oldPrice ? parsePrice(product.oldPrice) : undefined;
    addToCart({ id: product.id, name: product.name, slug: product.slug, price, oldPrice, icon: product.icon, brand: product.brand });
    setToastMsg(`${product.name} сагсанд нэмэгдлээ`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Images ── */}
        <section aria-label="images" className="flex flex-col gap-3">
          {/* Main image */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden relative">
            <Lens
              zoomFactor={2}
              lensSize={160}
              borderRadius="2xl"
              shadowIntensity="heavy"
              disabled={!images[imgIdx]?.isImage}
            >
              <div className="relative h-64 sm:h-80 md:h-[400px] flex items-center justify-center">
                {images[imgIdx]?.isImage ? (
                  <Image
                    src={images[imgIdx].src}
                    alt={images[imgIdx].alt}
                    fill
                    className={`object-contain p-2 ${images[imgIdx].isLogo ? 'opacity-20' : ''}`}
                    sizes="(max-width:768px) 100vw, 50vw"
                    unoptimized={true}
                  />
                ) : (
                  <div className="text-7xl sm:text-8xl opacity-50 select-none">{product.icon}</div>
                )}
              </div>
            </Lens>

            {/* Zoom button */}
            <button
              type="button"
              onClick={() => { setZoom({ scale: 1, rot: 0, flipX: false, flipY: false }); setZoomOpen(true); }}
              className="absolute top-3 right-3 z-30 bg-white/90 hover:bg-white border border-gray-200 rounded-xl p-2 text-gray-600 shadow-sm"
              aria-label="Zoom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 z-30 flex items-center pl-2">
                  <button
                    type="button"
                    onClick={() => setImgIdx((x) => (x - 1 + images.length) % images.length)}
                    className="bg-white/90 hover:bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-sm text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 z-30 flex items-center pr-2">
                  <button
                    type="button"
                    onClick={() => setImgIdx((x) => (x + 1) % images.length)}
                    className="bg-white/90 hover:bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-sm text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* Dot indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-primary' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={`rounded-xl border overflow-hidden shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 transition-colors ${
                    i === imgIdx ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={img.label}
                >
                  <div className="relative h-full w-full flex items-center justify-center">
                    {img.isImage ? (
                      <Image src={img.src} alt={img.alt} fill className={`object-contain p-1 ${img.isLogo ? 'opacity-20' : ''}`} sizes="64px" unoptimized={true} />
                    ) : (
                      <div className="text-xl opacity-60">{product.icon}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Zoom modal ── */}
        {zoomOpen && (
          <div className="fixed inset-0 z-[300]">
            <button type="button" className="absolute inset-0 bg-black/75" aria-label="Close" onClick={() => setZoomOpen(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
              <div className="w-full sm:w-[min(1100px,95vw)] h-[min(600px,90vh)] sm:h-[min(720px,90vh)] bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xl relative flex flex-col">
                {/* Header bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 shrink-0">
                  <span className="text-sm font-bold text-gray-700">{imgIdx + 1} / {images.length}</span>
                  <button type="button" onClick={() => setZoomOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Image area */}
                <div className="flex-1 bg-gray-50 flex items-center justify-center overflow-hidden select-none relative">
                  {/* Prev/Next on sides */}
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx((x) => (x - 1 + images.length) % images.length)}
                        className="absolute left-2 bg-white/90 border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-sm z-10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button onClick={() => setImgIdx((x) => (x + 1) % images.length)}
                        className="absolute right-2 bg-white/90 border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-sm z-10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </>
                  )}

                  {images[imgIdx]?.isImage ? (
                    <div
                      className="relative w-full h-full"
                      style={{ transform: `scale(${zoom.scale}) rotate(${zoom.rot}deg) scaleX(${zoom.flipX ? -1 : 1}) scaleY(${zoom.flipY ? -1 : 1})`, transition: 'transform 120ms ease-out' }}
                    >
                      <Image src={images[imgIdx].src} alt={images[imgIdx].alt} fill className={`object-contain ${images[imgIdx].isLogo ? 'opacity-20' : ''}`} sizes="95vw" unoptimized={true} />
                    </div>
                  ) : (
                    <div className="text-[180px] opacity-50"
                      style={{ transform: `scale(${zoom.scale}) rotate(${zoom.rot}deg) scaleX(${zoom.flipX ? -1 : 1}) scaleY(${zoom.flipY ? -1 : 1})`, transition: 'transform 120ms ease-out' }}>
                      {product.icon}
                    </div>
                  )}
                </div>

                {/* Controls bar */}
                <div className="flex items-center justify-center gap-2 px-4 py-2 border-t border-gray-100 flex-wrap shrink-0">
                  <button onClick={() => setZoom(z => ({ ...z, scale: Math.max(0.6, +(z.scale - 0.2).toFixed(2)) }))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">− Zoom</button>
                  <button onClick={() => setZoom(z => ({ ...z, scale: Math.min(3, +(z.scale + 0.2).toFixed(2)) }))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">+ Zoom</button>
                  <button onClick={() => setZoom(z => ({ ...z, rot: z.rot - 90 }))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">↺ Эргүүлэх</button>
                  <button onClick={() => setZoom(z => ({ ...z, flipX: !z.flipX }))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">↔ Flip X</button>
                  <button onClick={() => setZoom(z => ({ ...z, flipY: !z.flipY }))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">↕ Flip Y</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Details ── */}
        <section className="min-w-0">
          {/* Brand + Title */}
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Link href={`/search?q=${encodeURIComponent(product.brand)}`}
                className="inline-block text-xs font-bold text-primary uppercase tracking-wide mb-1 hover:underline">
                {product.brand}
              </Link>
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>
              <div className="mt-1 text-xs text-gray-400">{product.categoryLabel}</div>
            </div>
          </div>

          {/* Rating + action icons */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {new Array(5).fill(null).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-xs text-gray-400">(0)</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Wishlist */}
              <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 hover:border-gray-300 hover:text-primary transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="hidden sm:inline">Хадгалах</span>
              </button>
              {/* Compare */}
              <button
                onClick={() => toggleCompare({
                  id: product.id,
                  title: product.name,
                  slug: product.slug,
                  image: product.image,
                  brand: product.brand,
                  price: parsePrice(product.price),
                  oldPrice: product.oldPrice ? parsePrice(product.oldPrice) : undefined,
                })}
                className={`flex items-center gap-1 border rounded-lg px-2 py-1.5 text-xs transition-colors ${
                  inCompare
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">{inCompare ? 'Харьцуулж байна' : 'Харьцуулах'}</span>
              </button>
              {/* Share */}
              <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 hover:border-gray-300 hover:text-primary transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Хуваалцах</span>
              </button>
            </div>
          </div>

          {/* Price + Add to cart (desktop) */}
          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            {product.isPosLinked && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600 mb-3 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Дэлгүүрийн үлдэгдэлтэй синхрончлогдсон (Live)
              </div>
            )}
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xs text-gray-400 font-semibold mb-1">Үнэ · НӨАТ ороогүй</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-2xl sm:text-3xl font-black text-gray-900">{product.price}</div>
                  {product.oldPrice && (
                    <div className="text-sm text-gray-400 line-through">{product.oldPrice}</div>
                  )}
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`hidden sm:flex items-center gap-2 font-bold px-5 py-3 rounded-xl text-sm transition-colors shrink-0 ${
                  product.stock === 0
                    ? 'bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark text-white'
                }`}
              >
                {product.stock === 0 ? null : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                {product.stock === 0 ? 'Дууссан' : 'Сагсанд нэмэх'}
              </button>
            </div>

            {/* Mobile: full-width cart button inside price box */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`sm:hidden mt-3 w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-colors ${
                product.stock === 0
                  ? 'bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              {product.stock === 0 ? null : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
              {product.stock === 0 ? 'Дууссан' : 'Сагсанд нэмэх'}
            </button>
          </div>

          {/* Key specs */}
          {product.props.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-black text-gray-900 mb-3">Үзүүлэлт</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {product.props.map((x) => (
                  <div key={x.k} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2">
                    <dt className="text-xs font-bold text-gray-500 shrink-0">{x.k}:</dt>
                    <dd className="text-xs font-semibold text-gray-800 text-right">{x.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Payment options */}
          <div className="mt-5">
            <div className="text-sm font-black text-gray-900 mb-2">Төлбөрийн боломжууд</div>
            <div className="flex flex-wrap gap-2">
              {paymentOptions.map((x) => (
                <button key={x.key} type="button"
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-gray-300 transition-colors">
                  {x.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <div className="flex gap-0 border-b border-gray-200 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {(['details', 'specs', 'reviews'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                    tab === t ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}>
                  {t === 'details' ? 'Дэлгэрэнгүй' : t === 'specs' ? 'Үзүүлэлт' : 'Сэтгэгдэл (0)'}
                </button>
              ))}
            </div>
            <div className="pt-4">
              {tab === 'details' && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed">
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p className="text-gray-400">Тайлбар оруулаагүй байна</p>
                  )}
                </div>
              )}
              {tab === 'specs' && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  {product.props.length > 0 ? (
                    <dl className="divide-y divide-gray-100">
                      {product.props.map((x) => (
                        <div key={x.k} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <dt className="text-xs font-bold text-gray-500 min-w-[120px] shrink-0">{x.k}</dt>
                          <dd className="text-xs font-semibold text-gray-800 text-right">{x.v}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm text-gray-400">Үзүүлэлт байхгүй байна</p>
                  )}
                </div>
              )}
              {tab === 'reviews' && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
                  Үнэлгээ, сэтгэгдэл одоогоор байхгүй байна
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Sticky bottom bar — mobile only, sits above the MobileBottomNav */}
      <div className="fixed bottom-14 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-gray-400 font-semibold leading-none mb-0.5">Үнэ</div>
          <div className="text-lg font-black text-gray-900 leading-none">{product.price}</div>
          {product.oldPrice && (
            <div className="text-xs text-gray-400 line-through leading-none mt-0.5">{product.oldPrice}</div>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-colors ${
            product.stock === 0
              ? 'bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark text-white'
          }`}
        >
          {product.stock === 0 ? null : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
          {product.stock === 0 ? 'Дууссан' : 'Сагсанд нэмэх'}
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium whitespace-nowrap">
            {toastMsg}
          </div>
        </div>
      )}
    </>
  );
}
