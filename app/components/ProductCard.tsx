'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATEGORY_ICONS, type CatalogCategoryKey, formatPrice } from '../lib/mockCatalog';
import { toggleCompare, readCompare } from '../lib/compareStore';
import { useTenantHref } from '../lib/useTenantHref';
import { useTenant } from '../lib/TenantContext';
import { resolveUploadUrl } from '../lib/apiClient';

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
  const resolvedImage = resolveProductImageUrl(image);
  const fallbackImage = resolveProductImageUrl(branding.logo);

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

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleCompare({ id, title: name, slug, image: resolvedImage, brand, price, oldPrice });
    // Set state immediately — don't wait for the compare:changed event to propagate
    setInCompare(next.some((x) => x.id === id));
  };

  return (
    <Link
      href={tenantHref(`/product/${slug}`)}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
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
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
            {CATEGORY_ICONS[category]}
          </div>
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

        {/* Compare button */}
        <button
          type="button"
          onClick={handleCompare}
          aria-label={inCompare ? 'Харьцуулахаас хасах' : 'Харьцуулахад нэмэх'}
          className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center shadow transition-colors duration-150 ${
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

      {/* Info */}
      <div className="p-2.5 md:p-3 flex flex-col gap-0.5 flex-1">
        <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 truncate">
          {brand}
        </div>
        <div
          className="text-[11px] md:text-xs font-semibold text-gray-800 leading-snug flex-1"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {name}
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-xs md:text-sm font-black text-gray-900">{formatPrice(price)}</span>
          {oldPrice && (
            <span className="text-[10px] font-medium text-gray-400 line-through">{formatPrice(oldPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
