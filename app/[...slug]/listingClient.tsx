'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { addToCart } from '../lib/cartStore';
import { useTenantHref } from '../lib/useTenantHref';
import { readCompare, toggleCompare, writeCompare } from '../lib/compareStore';
import { formatPrice } from '../lib/mockCatalog';

type ProductVM = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: string;
  oldPrice?: string;
  badge: string | null;
  image?: string;
};

type Props = {
  category: { key: string; label: string; icon: string; id?: string };
  products: ProductVM[];
  categories: any[];
  allProducts: any[];
  currentCategoryId: string;
};

function cleanImageUrl(url: string | undefined): string {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/^(Оруулах|оруулах|[Oo]ruulah|[Uu]pload)/g, '').trim();
  return cleaned;
}

function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return 'http://localhost:8000';
}

function resolveCategoryIcon(image: string | undefined) {
  if (!image) {
    return { imageUrl: null, emoji: null };
  }
  
  const cleaned = cleanImageUrl(image);
  if (!cleaned) {
    return { imageUrl: null, emoji: null };
  }
  
  if (cleaned.length <= 4 && !cleaned.includes('/') && !cleaned.includes('.')) {
    return { imageUrl: null, emoji: cleaned };
  }
  
  const apiUrl = getApiUrl();
  const uploadMatch = cleaned.match(/\/upload\/(.+)$/);
  let imageUrl = '';
  if (uploadMatch) {
    imageUrl = `${apiUrl}/upload/${uploadMatch[1]}`;
  } else if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('data:')) {
    imageUrl = cleaned;
  } else {
    imageUrl = cleaned.startsWith('/') ? `${apiUrl}${cleaned}` : `${apiUrl}/upload/${cleaned}`;
  }
  return { imageUrl, emoji: null };
}

function FiltersPanel({
  sections,
  setSections,
  brandQuery,
  setBrandQuery,
  visibleBrands,
  selectedBrands,
  setSelectedBrands,
  selectedStatuses,
  setSelectedStatuses,
  statusCounts,
  brandCounts,
  onClearAll,
  categories,
  categoryCounts,
  currentCategoryId,
  tenantHref,
}: {
  sections: { status: boolean; brand: boolean; price: boolean };
  setSections: React.Dispatch<
    React.SetStateAction<{ status: boolean; brand: boolean; price: boolean }>
  >;
  brandQuery: string;
  setBrandQuery: React.Dispatch<React.SetStateAction<string>>;
  visibleBrands: string[];
  selectedBrands: Record<string, boolean>;
  setSelectedBrands: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selectedStatuses: Record<string, boolean>;
  setSelectedStatuses: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  statusCounts: Record<string, number>;
  brandCounts: Record<string, number>;
  onClearAll: () => void;
  categories: any[];
  categoryCounts: Record<string, number>;
  currentCategoryId: string;
  tenantHref: (path: string) => string;
}) {
  const isCategoryOrAncestorActive = (catId: string): boolean => {
    if (catId === currentCategoryId) return true;
    const activeCat = categories.find(c => c.id === currentCategoryId);
    if (activeCat && activeCat.parentId) {
      let temp = activeCat;
      while (temp.parentId) {
        if (temp.parentId === catId) return true;
        const parent = categories.find(c => c.id === temp.parentId);
        if (!parent) break;
        temp = parent;
      }
    }
    return false;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-50">
        <h2 className="font-black text-gray-900 text-sm">Шүүлтүүр</h2>
        <button type="button" onClick={onClearAll} className="text-xs font-bold text-gray-500 hover:text-primary">
          Цэвэрлэх
        </button>
      </div>

      {/* Categories Tree Section */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="font-black text-gray-900 text-sm mb-4">Ангилал</h3>
        <div className="space-y-3.5">
          {categories
            .filter((c) => !c.parentId)
            .map((root) => {
              const isExpanded = isCategoryOrAncestorActive(root.id);
              const isActive = root.id === currentCategoryId;
              const count = categoryCounts[root.id] || 0;
              const iconResolved = resolveCategoryIcon(root.image);
              const subCats = categories.filter((c) => c.parentId === root.id);

              return (
                <div key={root.id} className="space-y-2">
                  <Link
                    href={tenantHref(`/${root.slug}`)}
                    className={`flex items-center justify-between group py-0.5 ${
                      isActive ? 'text-primary font-bold' : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-6 h-6 rounded-md bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
                        {iconResolved.imageUrl ? (
                          <Image
                            src={iconResolved.imageUrl}
                            alt={root.name}
                            width={24}
                            height={24}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : iconResolved.emoji ? (
                          <span className="text-sm select-none leading-none">{iconResolved.emoji}</span>
                        ) : (
                          <span className="text-xs text-gray-400 select-none">📦</span>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm truncate select-none tracking-tight ${isActive ? 'font-black text-black' : 'font-semibold text-gray-700'}`}>
                        {root.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-bold shrink-0 pl-2">
                      {count}
                    </span>
                  </Link>

                  {isExpanded && subCats.length > 0 && (
                    <div className="pl-4 border-l border-gray-100 ml-3.5 space-y-2 py-0.5 animate-in slide-in-from-top-1 duration-150">
                      {subCats.map((sub) => {
                        const isSubActive = sub.id === currentCategoryId;
                        const subCount = categoryCounts[sub.id] || 0;
                        return (
                          <Link
                            key={sub.id}
                            href={tenantHref(`/${root.slug}/${sub.slug}`)}
                            className={`flex items-center justify-between py-0.5 group text-xs ${
                              isSubActive
                                ? 'text-primary font-bold'
                                : 'text-gray-500 hover:text-primary font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`shrink-0 text-[10px] select-none ${isSubActive ? 'text-primary' : 'text-gray-300'}`}>
                                &gt;
                              </span>
                              <span className="truncate select-none">
                                {sub.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-semibold shrink-0 pl-2">
                              {subCount}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Status Panel Section */}
      <div className="border-b border-gray-100 pb-4">
        <button
          type="button"
          className="w-full flex items-center justify-between text-sm font-black text-gray-900 py-1.5"
          onClick={() => setSections((s) => ({ ...s, status: !s.status }))}
        >
          <span>Төлөв</span>
          <span className="text-gray-400 font-medium">{sections.status ? '−' : '+'}</span>
        </button>
        {sections.status && (
          <div className="mt-3 space-y-2.5 text-xs sm:text-sm text-gray-600">
            {[
              { label: 'Шинээр ирсэн', key: 'Шинэ' },
              { label: 'Хямдралтай', key: 'Хямдрал' },
            ].map(({ label, key }) => {
              const count = statusCounts[key] || 0;
              return (
                <label key={key} className="flex items-center justify-between group cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedStatuses[key]}
                      onChange={(e) =>
                        setSelectedStatuses((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-700 group-hover:text-primary transition-colors text-xs sm:text-sm">
                      {label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Brands Panel Section */}
      <div>
        <button
          type="button"
          className="w-full flex items-center justify-between text-sm font-black text-gray-900 py-1.5"
          onClick={() => setSections((s) => ({ ...s, brand: !s.brand }))}
        >
          <span>Брэнд</span>
          <span className="text-gray-400 font-medium">{sections.brand ? '−' : '+'}</span>
        </button>
        {sections.brand && (
          <div className="mt-3 space-y-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Хайх"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50/50 placeholder-gray-400 font-semibold"
              />
            </div>

            <div className="space-y-2.5">
              {visibleBrands.length > 0 ? (
                visibleBrands.map((brand) => {
                  const count = brandCounts[brand] || 0;
                  return (
                    <label key={brand} className="flex items-center justify-between group cursor-pointer select-none">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!selectedBrands[brand]}
                          onChange={(e) =>
                            setSelectedBrands((s) => ({
                              ...s,
                              [brand]: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                        <span className="font-semibold text-gray-700 group-hover:text-primary transition-colors text-xs sm:text-sm">
                          {brand}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-bold">
                        {count}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="text-xs text-gray-400 text-center py-2">Брэнд олдсонгүй</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function parsePrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
}

export default function CategoryListingClient({
  category,
  products,
  categories,
  allProducts,
  currentCategoryId,
}: Props) {
  const tenantHref = useTenantHref();
  const [brandQuery, setBrandQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<Record<string, boolean>>({});
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, boolean>>({});
  const [sections, setSections] = useState<{ status: boolean; brand: boolean; price: boolean }>({
    status: true,
    brand: true,
    price: true,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sort, setSort] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Track compared product IDs
  const [compareIds, setCompareIds] = useState<Set<string>>(
    () => new Set(readCompare().map((x) => x.id))
  );

  const comparedProducts = useMemo(() => {
    return allProducts.filter((p: any) => compareIds.has(p.id));
  }, [allProducts, compareIds]);

  useEffect(() => {
    const updateCompare = () => {
      setCompareIds(new Set(readCompare().map((x) => x.id)));
    };
    window.addEventListener('compare:changed', updateCompare);
    window.addEventListener('storage', updateCompare);
    return () => {
      window.removeEventListener('compare:changed', updateCompare);
      window.removeEventListener('storage', updateCompare);
    };
  }, []);

  // Compute category product counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const childrenMap = new Map<string, string[]>();
    categories.forEach(c => {
      if (c.parentId) {
        if (!childrenMap.has(c.parentId)) {
          childrenMap.set(c.parentId, []);
        }
        childrenMap.get(c.parentId)!.push(c.id);
      }
    });

    function getDescendantIds(id: string): string[] {
      const res: string[] = [id];
      const children = childrenMap.get(id);
      if (children) {
        children.forEach(childId => {
          res.push(...getDescendantIds(childId));
        });
      }
      return res;
    }

    categories.forEach(c => {
      const descendantIds = new Set(getDescendantIds(c.id));
      counts[c.id] = allProducts.filter((p: any) => descendantIds.has(p.categoryId)).length;
    });

    return counts;
  }, [categories, allProducts]);

  // Compute status and brand dynamic counts based on the active category products
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Шинэ': 0, 'Хямдрал': 0 };
    products.forEach(p => {
      if (p.badge === 'Шинэ') counts['Шинэ']++;
      if (p.badge === 'Хямдрал') counts['Хямдрал']++;
    });
    return counts;
  }, [products]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [products]);

  const brands = useMemo(() => {
    const list = Object.keys(brandCounts);
    return list.sort((a, b) => {
      const diff = brandCounts[b] - brandCounts[a];
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });
  }, [brandCounts]);

  const filtered = useMemo(() => {
    let list = products;

    // Status Filter
    const activeStatuses = Object.keys(selectedStatuses).filter((s) => selectedStatuses[s]);
    if (activeStatuses.length) {
      list = list.filter((p) => activeStatuses.includes(p.badge || ''));
    }

    // Brand Filter
    const activeBrands = Object.keys(selectedBrands).filter((b) => selectedBrands[b]);
    if (activeBrands.length) {
      list = list.filter((p) => activeBrands.includes(p.brand));
    }

    if (sort === 'price_asc') {
      list = [...list].sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
    } else if (sort === 'price_desc') {
      list = [...list].sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));
    }
    return list;
  }, [products, selectedStatuses, selectedBrands, sort]);

  const activeBrandsList = useMemo(
    () => Object.keys(selectedBrands).filter((b) => selectedBrands[b]),
    [selectedBrands],
  );

  const visibleBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.toLowerCase().includes(q));
  }, [brands, brandQuery]);

  const clearAll = () => {
    setSelectedBrands({});
    setSelectedStatuses({});
    setBrandQuery('');
  };

  return (
    <div className="flex gap-0 relative">
      {/* Desktop Filters - Fixed Left */}
      <div className="hidden lg:block w-72 xl:w-72 shrink-0" aria-hidden="true" />
      <aside
        aria-label="filters"
        className="hidden lg:flex flex-col fixed top-24 left-0 w-72 bottom-0 z-30 overflow-y-auto px-4 py-4"
      >
        <div className="w-full space-y-4 pb-8">
          <FiltersPanel
            sections={sections}
            setSections={setSections}
            brandQuery={brandQuery}
            setBrandQuery={setBrandQuery}
            visibleBrands={visibleBrands}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            statusCounts={statusCounts}
            brandCounts={brandCounts}
            onClearAll={clearAll}
            categories={categories}
            categoryCounts={categoryCounts}
            currentCategoryId={currentCategoryId}
            tenantHref={tenantHref}
          />
        </div>
      </aside>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="bg-white min-h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-gray-900">Шүүлтүүр</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-gray-500 hover:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FiltersPanel
                sections={sections}
                setSections={setSections}
                brandQuery={brandQuery}
                setBrandQuery={setBrandQuery}
                visibleBrands={visibleBrands}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                selectedStatuses={selectedStatuses}
                setSelectedStatuses={setSelectedStatuses}
                statusCounts={statusCounts}
                brandCounts={brandCounts}
                onClearAll={clearAll}
                categories={categories}
                categoryCounts={categoryCounts}
                currentCategoryId={currentCategoryId}
                tenantHref={tenantHref}
              />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-bold"
              >
                Хаах ({filtered.length} бараа)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <section aria-label="title, sort, and brand filter" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4 mb-4">
          <div className="flex items-center justify-between gap-2 md:gap-3">
            <h2 className="text-base md:text-lg font-black text-gray-900">
              {category.label}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="lg:hidden text-sm font-bold border border-gray-200 rounded-xl px-2 py-1.5 md:px-3 md:py-2 text-gray-700 hover:border-gray-300"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                </svg>
                <span className="hidden sm:inline">Шүүлтүүр</span>
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'default' | 'price_asc' | 'price_desc')}
                className="text-sm border border-gray-200 rounded-xl px-2 py-1.5 md:px-3 md:py-2 focus:outline-none focus:border-primary bg-white text-gray-700 font-semibold"
                aria-label="sort"
              >
                <option value="default">Энгийн</option>
                <option value="price_asc">Үнэ өсөхөөр</option>
                <option value="price_desc">Үнэ буурахаар</option>
              </select>
            </div>
          </div>

          <div className="mt-2 md:mt-3 flex items-center justify-between text-sm text-gray-500">
            <div>
              Олдсон: <span className="font-bold text-gray-900">{filtered.length}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-bold text-gray-700">Брэндүүд</span>
              <button type="button" className="text-gray-500 hover:text-primary font-semibold">
                Бүх брэндүүд
              </button>
            </div>
          </div>

          {activeBrandsList.length > 0 && (
            <div className="mt-2 md:mt-3 flex flex-wrap gap-1 md:gap-2">
              {activeBrandsList.map((b) => (
                <button
                  key={b}
                  className="px-2 py-1 text-xs font-bold rounded-full bg-gray-50 text-gray-600 border border-gray-200"
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </section>

        <section aria-label="product list" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={tenantHref(`/product/${p.slug}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 md:h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 50vw, (max-width:1280px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="text-4xl md:text-6xl opacity-60">{category.icon}</div>
                  )}
                  {p.badge && (
                    <div className={`absolute top-1.5 md:top-2 left-1.5 md:left-2 text-xs md:text-xs font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg text-white ${p.badge === 'Шинэ' ? 'bg-primary' : 'bg-red-500'}`}>
                      {p.badge}
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute top-1.5 md:top-2 right-1.5 md:right-2 text-gray-300 hover:text-red-400 text-lg md:text-xl"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    ♡
                  </button>
                </div>
                <div className="p-2 md:p-3 pb-0">
                  <div className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-wide mb-1">{p.brand}</div>
                  <div className="text-xs md:text-sm font-bold text-gray-800 leading-snug">
                    <span
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {p.name}
                    </span>
                  </div>
                  <div className="mt-1.5 md:mt-2 flex items-baseline gap-2">
                    <div className="text-sm md:text-base font-black text-gray-900">{p.price}</div>
                    {p.oldPrice && <div className="text-[10px] md:text-xs text-gray-400 line-through font-semibold">{p.oldPrice}</div>}
                  </div>
                </div>
              </div>
              <div className="p-2 md:p-3 pt-0">
                {/* Comparison Checkbox */}
                <div
                  className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 pb-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary cursor-pointer select-none w-full">
                    <input
                      type="checkbox"
                      checked={compareIds.has(p.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const price = parsePrice(p.price);
                        const oldPrice = p.oldPrice ? parsePrice(p.oldPrice) : undefined;
                        toggleCompare({
                          id: p.id,
                          title: p.name,
                          slug: p.slug,
                          brand: p.brand,
                          image: p.image,
                          price,
                          oldPrice,
                        });
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Харьцуулах</span>
                  </label>
                </div>

                <button
                  type="button"
                  className="mt-2 w-full bg-primary hover:bg-primary-dark text-white text-xs md:text-xs font-black py-1.5 md:py-2 rounded-lg md:rounded-xl transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const price = parsePrice(p.price);
                    const oldPrice = p.oldPrice ? parsePrice(p.oldPrice) : undefined;
                    addToCart({
                      id: p.id,
                      name: p.name,
                      slug: p.slug,
                      price,
                      oldPrice,
                      brand: p.brand,
                      icon: category.icon,
                    });
                    setToastMsg('Бүтээгдэхүүнийг сагсанд нэмлээ!');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }}
                >
                  Сагсанд нэмэх
                </button>
              </div>
            </Link>
          ))}
        </section>
      </div>

      {/* Right Column - Dynamic Comparison Panel - Fixed Right */}
      <div className="hidden xl:block w-80 shrink-0" aria-hidden="true" />
      <aside
        aria-label="comparison"
        className="hidden xl:flex flex-col fixed top-24 right-0 w-80 bottom-0 z-30 overflow-y-auto px-4 py-4"
      >
        <div className="w-full space-y-4 pb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <style>{`
          .compare-bar-container {
            display: none !important;
          }
        `}</style>
        <div className="flex items-center justify-between pb-2 border-b border-gray-50">
          <h2 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
            <span>⚖️ Харьцуулалт</span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
              {comparedProducts.length}
            </span>
          </h2>
          {comparedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                writeCompare([]);
              }}
              className="text-xs font-bold text-gray-500 hover:text-primary transition-colors"
            >
              Цэвэрлэх
            </button>
          )}
        </div>

        {comparedProducts.length === 0 ? (
          <div className="py-12 px-4 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3 animate-pulse">⚖️</div>
            <h3 className="text-xs font-bold text-gray-700 mb-1">Харьцуулах бараа сонгоно уу</h3>
            <p className="text-[11px] text-gray-400 leading-normal max-w-[200px] mx-auto">
              Барааны "Харьцуулах" сонголтыг идэвхжүүлж зэрэгцүүлэн харах боломжтой
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* List of Compared Product Cards */}
            <div className="space-y-2.5">
              {comparedProducts.map((p, idx) => {
                const colors = [
                  { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500' },
                  { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500' },
                  { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500' },
                  { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500' }
                ];
                return (
                  <div key={p.id} className="relative flex gap-2.5 p-2 bg-gray-50/70 border border-gray-100 rounded-xl group/item">
                    <div className={`relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border-2 ${colors[idx % 4].border} bg-white flex items-center justify-center`}>
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" unoptimized />
                      ) : (
                        <span className="text-base">📦</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] text-gray-400 font-bold uppercase">{p.brandId || 'Дэлгүүр'}</div>
                      <div className="text-xs font-bold text-gray-800 truncate pr-4">{p.name}</div>
                      <div className="text-xs font-black text-gray-900 mt-0.5">
                        {formatPrice(p.salePrice ? p.salePrice : p.price)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        toggleCompare({
                          id: p.id,
                          title: p.name,
                          slug: p.slug,
                          brand: p.brandId || 'Дэлгүүр',
                          image: p.images?.[0],
                          price: p.salePrice || p.price,
                        });
                      }}
                      className="absolute top-1.5 right-1.5 w-4 h-4 bg-gray-200 hover:bg-red-500 hover:text-white text-gray-500 rounded-full flex items-center justify-center text-[10px] font-black transition-colors"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Live Parameter Matrix */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              {/* Price Row */}
              <div className="bg-gray-50/30 p-2.5 rounded-xl border border-gray-100">
                <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Үнэ</div>
                <div className="space-y-1.5">
                  {comparedProducts.map((p, idx) => {
                    const colors = [
                      { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500' },
                      { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500' },
                      { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500' },
                      { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500' }
                    ];
                    return (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${colors[idx % 4].bg}`} />
                          <span className="font-semibold text-gray-600 truncate">{p.name.split(' (')[0]}</span>
                        </div>
                        <span className="font-bold text-gray-900 shrink-0">
                          {formatPrice(p.salePrice ? p.salePrice : p.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Brand Row */}
              <div className="bg-gray-50/30 p-2.5 rounded-xl border border-gray-100">
                <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Брэнд</div>
                <div className="space-y-1.5">
                  {comparedProducts.map((p, idx) => {
                    const colors = [
                      { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500' },
                      { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500' },
                      { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500' },
                      { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500' }
                    ];
                    return (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${colors[idx % 4].bg}`} />
                          <span className="font-semibold text-gray-600 truncate">{p.name.split(' (')[0]}</span>
                        </div>
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase shrink-0">
                          {p.brandId || 'Дэлгүүр'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Specifications */}
              {["Материал", "Баталгаат хугацаа", "Үйлдвэрлэсэн улс"].map(specKey => {
                return (
                  <div key={specKey} className="bg-gray-50/30 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{specKey}</div>
                    <div className="space-y-2">
                      {comparedProducts.map((p, idx) => {
                        const colors = [
                          { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500' },
                          { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500' },
                          { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500' },
                          { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500' }
                        ];
                        const val = p.specifications?.[specKey] || 'Тодорхойгүй';
                        return (
                          <div key={p.id} className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${colors[idx % 4].bg}`} />
                              <span className="font-semibold text-gray-500 truncate">{p.name.split(' (')[0]}</span>
                            </div>
                            <div className="pl-3.5 text-xs font-bold text-gray-800 leading-normal">
                              {val}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </aside>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute right-0 top-0 bottom-0 w-[min(420px,90vw)] bg-white p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="font-black text-gray-900">Шүүлтүүр</div>
              <button
                type="button"
                className="text-sm font-bold text-gray-600"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Хаах
              </button>
            </div>
            <FiltersPanel
              sections={sections}
              setSections={setSections}
              brandQuery={brandQuery}
              setBrandQuery={setBrandQuery}
              visibleBrands={visibleBrands}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              selectedStatuses={selectedStatuses}
              setSelectedStatuses={setSelectedStatuses}
              statusCounts={statusCounts}
              brandCounts={brandCounts}
              onClearAll={clearAll}
              categories={categories}
              categoryCounts={categoryCounts}
              currentCategoryId={currentCategoryId}
              tenantHref={tenantHref}
            />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  );
}
