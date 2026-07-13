'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORY_ICONS, type CatalogCategoryKey, formatPrice } from '../lib/mockCatalog';
import { toggleCompare, readCompare } from '../lib/compareStore';
import { addToCart } from '../lib/cartStore';
import { useTenantHref } from '../lib/useTenantHref';
import { useTenant } from '../lib/TenantContext';
import { resolveUploadUrl } from '../lib/apiClient';
import ImagePlaceholder from './ImagePlaceholder';

type Props = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CatalogCategoryKey;
  price: number;
  oldPrice?: number;
  isNew?: boolean;
  isSale?: boolean;
  image?: string;
  stock?: number;
};

function resolveProductImageUrl(url: string | undefined) {
  return resolveUploadUrl(url);
}

export default function ProductCard({ id, slug, name, brand, category, price, oldPrice, isNew, image, stock }: Props) {
  const tenantHref = useTenantHref();
  const { branding } = useTenant();
  const discountPct = oldPrice ? Math.round((1 - price / oldPrice) * 100) : null;
  const [inCompare, setInCompare] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const resolvedImage = resolveProductImageUrl(image);
  const fallbackImage = resolveProductImageUrl(branding.logo);
  const previewImage = resolvedImage ?? fallbackImage;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const update = () => setInCompare(readCompare().some((x) => x.id === id));
    update();
    window.addEventListener('compare:changed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('compare:changed', update);
      window.removeEventListener('storage', update);
    };
  }, [id]);

  // Lock body scroll while the quick-view modal is open
  useEffect(() => {
    if (!quickOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [quickOpen]);

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleCompare({ id, title: name, slug, image: resolvedImage, brand, price, oldPrice });
    setInCompare(next.some((x) => x.id === id));
  };

  const openQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, slug, name, price, oldPrice, icon: CATEGORY_ICONS[category] ?? '📦', brand });
    window.dispatchEvent(new Event('cart:changed'));
  };

  return (
    <Link
      href={tenantHref(`/product/${slug}`)}
      className="group flex flex-col bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {resolvedImage ? (
          <Image
            src={resolvedImage}
            alt={name}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${stock === 0 ? 'grayscale opacity-60' : ''}`}
            sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
            unoptimized={true}
          />
        ) : fallbackImage ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 p-6">
            <Image
              src={fallbackImage}
              alt={branding.name ?? 'Logo'}
              fill
              className={`object-contain opacity-25 ${stock === 0 ? 'grayscale opacity-40' : ''}`}
              sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
              unoptimized={true}
            />
          </div>
        ) : (
          <ImagePlaceholder />
        )}

        {/* Discount / NEW / Out of Stock badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {stock === 0 ? (
            <span className="bg-gray-800 text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none shadow uppercase tracking-wide">
              Дууссан
            </span>
          ) : discountPct ? (
            <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none shadow">
              -{discountPct}%
            </span>
          ) : isNew ? (
            <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none shadow">
              NEW
            </span>
          ) : null}
        </div>

        {/* Hover actions: quick view + compare */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={openQuickView}
            aria-label="Хялбар үзэлт"
            title="Хялбар үзэлт"
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow bg-white/90 text-gray-500 hover:text-primary opacity-0 group-hover:opacity-100 transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleCompare}
            aria-label={inCompare ? 'Харьцуулахаас хасах' : 'Харьцуулахад нэмэх'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center shadow transition-colors duration-150 ${
              inCompare
                ? 'bg-primary text-white opacity-100'
                : 'bg-white/90 text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info — shoppy-style: name first, subtitle, price (sale-coloured) */}
      <div className="p-2.5 md:p-3 flex flex-col gap-0.5 flex-1">
        <div
          className="text-[11px] md:text-[13px] font-bold text-gray-900 leading-snug flex-1"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {name}
        </div>
        <div className="text-[10px] md:text-[11px] text-gray-400 truncate">{brand}</div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={`text-xs md:text-sm font-black ${oldPrice ? 'text-primary' : 'text-gray-900'}`}>{formatPrice(price)}</span>
          {oldPrice && (
            <span className="text-[10px] font-medium text-gray-400 line-through">{formatPrice(oldPrice)}</span>
          )}
        </div>
        {typeof stock === 'number' && (
          stock > 0 ? (
            <div className={`text-[9px] md:text-[10px] font-bold mt-1 ${stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
              Үлдэгдэл: {stock.toLocaleString('mn-MN')}ш
            </div>
          ) : (
            <div className="text-[9px] md:text-[10px] font-bold mt-1 text-gray-400">Дууссан</div>
          )
        )}
      </div>

      {/* Quick view modal (portal — kept out of the <a> DOM tree) */}
      {mounted && quickOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden grid sm:grid-cols-2"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickOpen(false); }}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-gray-500 hover:text-gray-800 shadow flex items-center justify-center"
              aria-label="Хаах"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="relative aspect-square sm:aspect-auto sm:min-h-[320px] bg-gray-50 flex items-center justify-center p-6">
              {previewImage ? (
                <Image src={previewImage} alt={name} fill className="object-contain p-6" sizes="(max-width:640px) 100vw, 320px" unoptimized />
              ) : (
                <span className="text-6xl opacity-30">{CATEGORY_ICONS[category]}</span>
              )}
              {discountPct ? (
                <span className="absolute top-3 left-3 bg-primary text-white text-xs font-black px-2 py-0.5 rounded shadow">-{discountPct}%</span>
              ) : null}
            </div>

            {/* Details */}
            <div className="p-5 sm:p-6 flex flex-col">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{brand}</div>
              <h3 className="text-base font-bold text-gray-900 leading-snug mb-3">{name}</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl font-black text-primary">{formatPrice(price)}</span>
                {oldPrice && <span className="text-sm font-medium text-gray-400 line-through">{formatPrice(oldPrice)}</span>}
              </div>
              {stock === 0 ? (
                <p className="text-sm font-semibold text-gray-400 mb-4">Дууссан</p>
              ) : (
                <p className="text-xs text-emerald-600 mb-4 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {typeof stock === 'number' ? `Үлдэгдэл: ${stock.toLocaleString('mn-MN')}ш` : 'Бэлэн байгаа'}
                </p>
              )}
              <div className="mt-auto flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Сагсанд нэмэх
                </button>
                <Link
                  href={tenantHref(`/product/${slug}`)}
                  onClick={() => setQuickOpen(false)}
                  className="w-full py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-colors text-center"
                >
                  Дэлгэрэнгүй харах
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </Link>
  );
}
