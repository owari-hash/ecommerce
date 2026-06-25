'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { formatPrice, CATEGORY_LABELS } from '../lib/mockCatalog';
import { useTenant } from '../lib/TenantContext';
import { resolveUploadUrl } from '../lib/apiClient';

type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image?: string;
  isSale: boolean;
  isNew: boolean;
  stock?: number;
};

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { tenantId, branding } = useTenant();
  const tenantName = branding?.name ?? '';
  const [apiProducts, setApiProducts] = useState<SearchProduct[]>([]);

  useEffect(() => {
    fetch(`/api/products/public?tenantId=${tenantId}`)
      .then(r => r.json())
      .then(body => {
        if (!body?.data) return;
        setApiProducts(
          body.data.map((p: any): SearchProduct => {
            return {
              id: p.id,
              slug: p.slug || p.id,
              name: p.name,
              brand: (p.brandId && p.brandId !== 'br1') ? p.brandId : tenantName,
              image: resolveUploadUrl(p.images?.[0]),
              price: p.salePrice || p.price,
              oldPrice: p.salePrice ? p.price : undefined,
              isSale: !!p.salePrice,
              isNew: !!p.featured,
              stock: p.stock ?? 0,
            };
          })
        );
      })
      .catch(console.error);
  }, [tenantId]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const normalizedQuery = query.toLowerCase().trim();
    return apiProducts.filter((p) =>
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.brand.toLowerCase().includes(normalizedQuery)
    );
  }, [query, apiProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Хайлт</span>
      </nav>

      <h1 className="text-2xl font-black text-gray-800 mb-2">
        Хайлт: "{query}"
      </h1>
      <p className="text-gray-500 mb-8">
        {results.length > 0 
          ? `${results.length} бараа олдлоо` 
          : 'Хайлтад тохирох бараа олдсонгүй'}
      </p>

      {/* Search Form */}
      <div className="mb-8">
        <form className="flex max-w-xl" action="/search" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Бараа, брэнд хайх..."
            className="flex-1 border border-gray-300 rounded-l-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-r-xl font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Хайх
          </button>
        </form>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              {/* Product Image */}
              <div className="h-32 bg-gray-50 relative overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className={`object-cover ${product.stock === 0 ? 'grayscale opacity-60' : ''}`}
                    sizes="(max-width:640px) 50vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📦
                  </div>
                )}
                {product.stock === 0 ? (
                  <span className="absolute top-2 left-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Дууссан
                  </span>
                ) : product.isSale ? (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Хямдрал
                  </span>
                ) : product.isNew ? (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Шинэ
                  </span>
                ) : null}
              </div>
              
              <div className="p-3">
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-wide mb-1">
                  {product.brand}
                </div>
                <h3
                  className="text-xs font-bold text-gray-800 leading-snug group-hover:text-primary transition-colors"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {product.name}
                </h3>
                
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-sm font-black text-gray-900">
                    {product.price ? formatPrice(product.price) : '—'}
                  </span>
                  {product.oldPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        /* No Results */
        <div className="text-center py-16">
          <div className="text-7xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            "{query}" хайлтад тохирох бараа олдсонгүй
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Өөр түлхүүр үг ашиглан хайх эсвэл дараах ангиллуудаас хайна уу:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/${key}`}
                className="px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-primary rounded-full text-sm font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* Empty Query */
        <div className="text-center py-16">
          <div className="text-7xl mb-4">⌨️</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Хайх үгээ оруулна уу
          </h2>
          <p className="text-gray-400 mb-6">
            Барааны нэр, брэнд, ангилал, эсвэл шинж чанараар хайна уу
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            <span className="text-sm text-gray-500">Жишээ:</span>
            {['Acer', 'MacBook', 'Sony', 'PlayStation', 'ASUS'].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1 bg-red-50 text-primary rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
