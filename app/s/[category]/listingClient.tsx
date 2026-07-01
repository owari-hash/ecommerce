'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { addToCart, readCart, updateQuantity, removeFromCart } from '../../lib/cartStore';
import { useTenantHref } from '../../lib/useTenantHref';
import { useTenant } from '../../lib/TenantContext';

type ProductVM = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: string;
  oldPrice?: string;
  badge: string | null;
};

type Props = {
  category: { key: string; label: string; icon: string };
  products: ProductVM[];
};

function FiltersPanel({
  sections,
  setSections,
  brandQuery,
  setBrandQuery,
  visibleBrands,
  selectedBrands,
  setSelectedBrands,
  onClearAll,
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
  onClearAll: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-gray-900 text-sm">Шүүлтүүр</h2>
        <button type="button" onClick={onClearAll} className="text-xs font-bold text-gray-500 hover:text-primary">
          Цэвэрлэх
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <button
            type="button"
            className="w-full flex items-center justify-between text-sm font-bold text-gray-700"
            onClick={() => setSections((s) => ({ ...s, status: !s.status }))}
          >
            <span>Төлөв</span>
            <span className="text-gray-400">{sections.status ? '−' : '+'}</span>
          </button>
          {sections.status && (
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              {['Шинэ', 'Хямдрал'].map((x) => (
                <label key={x} className="flex items-center gap-2 cursor-not-allowed opacity-70">
                  <input type="checkbox" disabled /> {x}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            className="w-full flex items-center justify-between text-sm font-bold text-gray-700"
            onClick={() => setSections((s) => ({ ...s, brand: !s.brand }))}
          >
            <span>Брэнд</span>
            <span className="text-gray-400">{sections.brand ? '−' : '+'}</span>
          </button>
          {sections.brand && (
            <>
              <div className="mt-3">
                <input
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  placeholder="Хайх"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                />
              </div>
              <div className="mt-3 max-h-60 overflow-auto pr-1 space-y-2">
                {visibleBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selectedBrands[brand]}
                      onChange={(e) => setSelectedBrands((s) => ({ ...s, [brand]: e.target.checked }))}
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <button
            type="button"
            className="w-full flex items-center justify-between text-sm font-bold text-gray-700"
            onClick={() => setSections((s) => ({ ...s, price: !s.price }))}
          >
            <span>Үнэ</span>
            <span className="text-gray-400">{sections.price ? '−' : '+'}</span>
          </button>
          {sections.price && (
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              {['100,000₮ хүртэл', '100,000 - 500,000₮', '500,000 - 1,000,000₮', '1,000,000₮-аас дээш'].map(
                (r) => (
                  <label key={r} className="flex items-center gap-2 cursor-not-allowed opacity-70">
                    <input type="checkbox" disabled /> {r}
                  </label>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function parsePrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
}

export default function CategoryListingClient({ category, products }: Props) {
  const tenantHref = useTenantHref();
  const { branding } = useTenant();
  const primaryColor = branding?.primaryColor ?? '#D32F2F';
  const [brandQuery, setBrandQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<Record<string, boolean>>({});
  const [sections, setSections] = useState<{ status: boolean; brand: boolean; price: boolean }>({
    status: true,
    brand: true,
    price: true,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sort, setSort] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [cartMap, setCartMap] = useState<Record<string, number>>({});

  const syncCart = () => {
    const items = readCart();
    const map: Record<string, number> = {};
    items.forEach((i) => {
      map[i.id] = i.quantity;
    });
    setCartMap(map);
  };

  useEffect(() => {
    syncCart();
    window.addEventListener('cart:changed', syncCart);
    return () => {
      window.removeEventListener('cart:changed', syncCart);
    };
  }, []);

  const handleIncrease = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(id, (cartMap[id] ?? 0) + 1);
  };

  const handleDecrease = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const next = (cartMap[id] ?? 1) - 1;
    if (next <= 0) removeFromCart(id);
    else updateQuantity(id, next);
  };

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    const activeBrands = Object.keys(selectedBrands).filter((b) => selectedBrands[b]);
    let list = products;
    if (activeBrands.length) list = list.filter((p) => activeBrands.includes(p.brand));

    if (sort === 'price_asc') {
      list = [...list].sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
    } else if (sort === 'price_desc') {
      list = [...list].sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));
    }
    return list;
  }, [products, selectedBrands, sort]);

  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrands, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    return filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1);
      }
    }
    return pages;
  };


  const activeBrands = useMemo(
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
    setBrandQuery('');
  };

  return (
    <div className="flex gap-6">
      <aside aria-label="filters" className="hidden lg:block w-72 shrink-0 space-y-4 sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
        <FiltersPanel
          sections={sections}
          setSections={setSections}
          brandQuery={brandQuery}
          setBrandQuery={setBrandQuery}
          visibleBrands={visibleBrands}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          onClearAll={clearAll}
        />
      </aside>

      <div className="flex-1 min-w-0">
        <section aria-label="title, sort, and brand filter" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-gray-900">
              {category.label} <span className="text-gray-400 font-bold">Түр хүлээнэ үү...</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="lg:hidden text-sm font-bold border border-gray-200 rounded-xl px-3 py-2 text-gray-700 hover:border-gray-300"
                onClick={() => setMobileFiltersOpen(true)}
              >
                Шүүлтүүр
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'default' | 'price_asc' | 'price_desc')}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary bg-white text-gray-700 font-semibold"
                aria-label="sort"
              >
                <option value="default">Энгийн</option>
                <option value="price_asc">Үнэ өсөхөөр</option>
                <option value="price_desc">Үнэ буурахаар</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
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

          {activeBrands.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  className="px-3 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/20 text-xs font-bold"
                  onClick={() => setSelectedBrands((s) => ({ ...s, [b]: false }))}
                >
                  {b} ×
                </button>
              ))}
              <button
                type="button"
                className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200 text-xs font-bold"
                onClick={clearAll}
              >
                Бүгдийг цэвэрлэх
              </button>
            </div>
          )}
        </section>

        <section aria-label="product list" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((p) => (
            <Link
              key={p.id}
              href={tenantHref(`/product/${p.slug}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="relative h-44 bg-gray-50 flex items-center justify-center">
                <div className="text-6xl opacity-60">{category.icon}</div>
                {p.badge && (
                  <div className={`absolute top-2 left-2 text-xs font-black px-2 py-1 rounded-lg text-white ${p.badge === 'Шинэ' ? 'bg-emerald-500' : 'bg-primary'}`}>
                    {p.badge}
                  </div>
                )}
                <button
                  type="button"
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-400 text-xl"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  ♡
                </button>
              </div>
              <div className="p-3">
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-wide mb-1">{p.brand}</div>
                <div className="text-sm font-bold text-gray-800 leading-snug">
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
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-base font-black text-gray-900">{p.price}</div>
                  {p.oldPrice && <div className="text-xs text-gray-400 line-through font-semibold">{p.oldPrice}</div>}
                </div>
                {cartMap[p.id] ? (
                  <div
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="mt-3 flex items-center justify-between rounded-xl overflow-hidden border-2 text-sm font-black"
                    style={{ borderColor: primaryColor }}
                  >
                    <button
                      onClick={(e) => handleDecrease(e, p.id)}
                      className="px-3 py-1.5 transition-colors hover:bg-gray-50 text-gray-700 text-base leading-none"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-xs font-black" style={{ color: primaryColor }}>
                      {cartMap[p.id]}
                    </span>
                    <button
                      onClick={(e) => handleIncrease(e, p.id)}
                      className="px-3 py-1.5 text-white transition-colors text-base leading-none"
                      style={{ backgroundColor: primaryColor }}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="mt-3 w-full bg-primary hover:bg-primary-dark text-white text-xs font-black py-2 rounded-xl transition-colors"
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
                        icon: category.icon,
                        brand: p.brand,
                      });
                      setToastMsg(`${p.name} сагсанд нэмэгдлээ`);
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 2000);
                    }}
                  >
                    Сагслах
                  </button>
                )}
              </div>
            </Link>
          ))}
        </section>

        {totalPages > 1 && (
          <div className="mt-8 mb-4 flex justify-center items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none bg-white"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none bg-white"
            >
              ‹
            </button>
            {getPageNumbers().map((p, idx) => {
              if (p === -1) {
                return (
                  <span key={`ell-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-xs font-bold select-none">
                    ...
                  </span>
                );
              }
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${
                    isCurrent
                      ? 'text-white border-transparent shadow-md shadow-primary/20'
                      : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary bg-white'
                  }`}
                  style={isCurrent ? { backgroundColor: primaryColor || '#4f46e5' } : undefined}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none bg-white"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none bg-white"
            >
              »
            </button>
          </div>
        )}
      </div>

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
              onClearAll={clearAll}
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

