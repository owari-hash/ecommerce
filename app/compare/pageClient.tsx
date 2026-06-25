'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { readCompare, writeCompare, type CompareItem } from '../lib/compareStore';
import { formatPrice } from '../lib/mockCatalog';
import { addToCart } from '../lib/cartStore';
import { useTenantHref } from '../lib/useTenantHref';
import { resolveUploadUrl } from '../lib/apiClient';

type FullProduct = {
  id: string;
  slug?: string;
  name: string;
  brandId?: string;
  price: number;
  salePrice?: number | null;
  images?: string[];
  specifications?: Record<string, string>;
  description?: string;
};

type EnrichedItem = CompareItem & {
  full?: FullProduct;
  specs: Array<{ k: string; v: string }>;
};

export default function ComparePageClient({ tenantId }: { tenantId: string }) {
  const tenantHref = useTenantHref();
  const [items, setItems] = useState<CompareItem[]>([]);
  const [fullProducts, setFullProducts] = useState<Record<string, FullProduct>>({});
  const [loadingFull, setLoadingFull] = useState(false);

  // Keep compare list in sync with localStorage
  useEffect(() => {
    const update = () => setItems(readCompare());
    update();
    window.addEventListener('compare:changed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('compare:changed', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  // Fetch full product data from API when tenantId or items change
  useEffect(() => {
    if (!tenantId || items.length === 0) return;
    const apiUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');
    setLoadingFull(true);
    fetch(`${apiUrl}/api/products/public?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((body) => {
        const map: Record<string, FullProduct> = {};
        (body?.data ?? []).forEach((p: FullProduct) => { map[p.id] = p; });
        setFullProducts(map);
      })
      .catch(() => {/* graceful degradation */})
      .finally(() => setLoadingFull(false));
  }, [tenantId, items.length]);

  // Merge stored compare items with fetched full data
  const enriched = useMemo<EnrichedItem[]>(() =>
    items.map((item) => {
      const full = fullProducts[item.id];
      const specs: Array<{ k: string; v: string }> = full?.specifications
        ? Object.entries(full.specifications).map(([k, v]) => ({ k, v: String(v) }))
        : [];
      return { ...item, full, specs };
    }),
    [items, fullProducts],
  );

  // All unique spec keys across compared products
  const specKeys = useMemo(() => {
    const keys: string[] = [];
    const seen = new Set<string>();
    enriched.forEach((p) => {
      p.specs.forEach(({ k }) => {
        if (!seen.has(k)) { seen.add(k); keys.push(k); }
      });
    });
    return keys;
  }, [enriched]);

  const remove = (id: string) => {
    writeCompare(readCompare().filter((x) => x.id !== id));
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
          <Link href={tenantHref('/')} className="hover:text-primary">Нүүр</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Харьцуулах</span>
        </nav>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-7xl mb-4 opacity-40">⚖️</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Харьцуулах бараа байхгүй байна</h2>
          <p className="text-gray-400 mb-6 text-sm">Барааны картнаас харьцуулах дүрсийг дарж нэмнэ үү</p>
          <Link
            href={tenantHref('/')}
            className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Бараа хайх
          </Link>
        </div>
      </div>
    );
  }

  // ── Main comparison table ────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb + header */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1">
        <Link href={tenantHref('/')} className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Харьцуулах</span>
      </nav>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          Харьцуулах
          <span className="ml-2 text-base font-bold text-gray-400">({items.length} бараа)</span>
        </h1>
        <button
          type="button"
          className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
          onClick={() => writeCompare([])}
        >
          Бүгдийг устгах
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full" style={{ minWidth: `${180 + enriched.length * 220}px` }}>
          {/* Product header row */}
          <thead>
            <tr className="border-b border-gray-100">
              <th className="w-44 p-4 bg-gray-50 text-left text-xs font-black uppercase tracking-widest text-gray-400 align-bottom">
                Шинж чанар
              </th>

              {enriched.map((p) => {
                // Prefer fetched data, fall back to stored data
                const price = p.full?.salePrice ?? p.full?.price ?? p.price;
                const oldPrice = p.full?.salePrice ? p.full.price : p.oldPrice;
                const image = resolveUploadUrl(p.full?.images?.[0] ?? p.image);
                const title = p.full?.name ?? p.title;
                const brand = p.full?.brandId ?? p.brand;
                const slug = p.full?.slug || p.slug || p.id;
                const discountPct = (price != null && oldPrice != null && oldPrice > price)
                  ? Math.round((1 - price / oldPrice) * 100)
                  : null;

                return (
                  <th key={p.id} className="p-4 text-left align-top border-l border-gray-100 min-w-[220px]">
                    <div className="flex flex-col gap-3">
                      {/* Image */}
                      <div className="relative w-full aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden">
                        {image ? (
                          <Image src={image} alt={title} fill className="object-cover" sizes="220px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">📦</div>
                        )}
                        {discountPct != null && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none">
                            -{discountPct}%
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/90 hover:bg-red-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 text-xs transition-colors"
                          aria-label="Устгах"
                        >
                          ×
                        </button>
                      </div>

                      {/* Brand */}
                      {brand && (
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {brand}
                        </div>
                      )}

                      {/* Name */}
                      <Link
                        href={tenantHref(`/product/${slug}`)}
                        className="text-sm font-black text-gray-900 leading-tight hover:text-primary transition-colors line-clamp-2"
                      >
                        {title}
                      </Link>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-gray-900">
                          {price != null ? formatPrice(price) : '—'}
                        </span>
                        {oldPrice != null && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(oldPrice)}</span>
                        )}
                      </div>

                      {/* Cart button — use stored data, always works */}
                      <button
                        type="button"
                        onClick={() => {
                          addToCart({
                            id: p.id,
                            name: title,
                            slug,
                            price: price ?? 0,
                            oldPrice: oldPrice ?? undefined,
                            icon: '📦',
                            brand: brand || 'Дэлгүүр',
                          });
                        }}
                        className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Сагсанд нэмэх
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Spec rows */}
          <tbody>
            {loadingFull && (
              <tr>
                <td colSpan={enriched.length + 1} className="p-6 text-center text-sm text-gray-400 animate-pulse">
                  Үзүүлэлт ачааллаж байна...
                </td>
              </tr>
            )}
            {!loadingFull && specKeys.length === 0 && (
              <tr>
                <td colSpan={enriched.length + 1} className="p-6 text-center text-sm text-gray-400">
                  Харьцуулах үзүүлэлт олдсонгүй
                </td>
              </tr>
            )}
            {specKeys.map((key, rowIdx) => {
              const vals = enriched.map((p) => p.specs.find((s) => s.k === key)?.v ?? null);
              const filled = vals.filter(Boolean);
              const allSame = filled.length > 1 && vals.every((v) => v === filled[0]);

              return (
                <tr key={key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                  <td className="p-3 text-xs font-bold text-gray-500 bg-gray-50 border-t border-gray-100">
                    {key}
                  </td>
                  {vals.map((val, ci) => (
                    <td
                      key={ci}
                      className={`p-3 text-xs border-l border-t border-gray-100 ${
                        val == null
                          ? 'text-gray-300'
                          : allSame
                          ? 'text-gray-700'
                          : 'text-gray-900 font-semibold'
                      }`}
                    >
                      {val ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
