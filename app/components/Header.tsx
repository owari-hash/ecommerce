'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getCartCount } from '../lib/cartStore';
import { readAuth, logout, type User } from '../lib/authStore';
import { MOCK_PRODUCTS, CATEGORY_ICONS, CATEGORY_LABELS, formatPrice, type CatalogCategoryKey } from '../lib/mockCatalog';
import { addToCart } from '../lib/cartStore';
import MegaMenu from './MegaMenu';

const categories = [
  { label: 'Зөөврийн компьютер', href: '/laptop' },
  { label: 'Суурин компьютер', href: '/computer' },
  { label: 'Ухаалаг төхөөрөмж', href: '/smartphone-and-tablet' },
  { label: 'Консоль', href: '/console' },
  { label: 'Аудио төхөөрөмж', href: '/audio-equipment' },
  { label: 'Гэр ахуй', href: '/home' },
  { label: 'Дагалдах хэрэгсэл', href: '/accessories' },
  { label: 'Брэнд', href: '/brands' },
];

export default function Header() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCartCount(getCartCount());
    setUser(readAuth());
    const onCartChange = () => setCartCount(getCartCount());
    const onAuthChange = () => setUser(readAuth());
    window.addEventListener('cart:changed', onCartChange);
    window.addEventListener('auth:changed', onAuthChange);
    return () => {
      window.removeEventListener('cart:changed', onCartChange);
      window.removeEventListener('auth:changed', onAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const searchSuggestions = useMemo(() => {
    if (debouncedSearch.trim().length < 1) return [];
    const query = debouncedSearch.toLowerCase();
    return MOCK_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [debouncedSearch]);

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    setSearch('');
    router.push(`/product/${slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: typeof MOCK_PRODUCTS[0]) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      icon: CATEGORY_ICONS[product.category],
      brand: product.brand,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setShowSuggestions(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(value), 150);
  };

  const categoriesList = useMemo(() => {
    return Object.entries(CATEGORY_LABELS).slice(0, 5) as [CatalogCategoryKey, string][];
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Bar – hidden on mobile */}
      <div className="hidden sm:block bg-[#0a1628] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:77777734" className="hover:text-red-300 transition-colors flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              7777-7734
            </a>
            <a href="tel:77777754" className="hover:text-red-300 transition-colors flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              7777-7754
            </a>
          </div>
          <span className="text-gray-300 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            Өдөр бүр 10:00 - 20:00
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-100 py-2">
        <div className="max-w-7xl mx-auto px-3 flex items-center gap-2">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="Их Наяд" className="h-8 sm:h-10 w-auto object-contain" />
          </Link>

          {/* Search */}
          <div ref={searchRef} className="flex-1 min-w-0 relative">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Бараа хайх..."
                className="flex-1 min-w-0 border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-3 sm:px-4 py-2 rounded-r-lg transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>

            {/* Search Suggestions — mobile-friendly simple list */}
            {showSuggestions && search.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                {/* Mobile: simple list; Desktop: two-column */}
                <div className="block sm:hidden">
                  {searchSuggestions.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {searchSuggestions.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSuggestionClick(product.slug)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {product.image
                              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              : <span className="text-lg">{CATEGORY_ICONS[product.category]}</span>
                            }
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-800 truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">{formatPrice(product.price)}</div>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={() => { setShowSuggestions(false); router.push(`/search?q=${encodeURIComponent(search)}`); }}
                        className="w-full px-4 py-3 text-sm text-primary font-bold text-center bg-gray-50"
                      >
                        Бүх үр дүнг харах →
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      &ldquo;{search}&rdquo; олдсонгүй
                      <button
                        onClick={() => { setShowSuggestions(false); router.push(`/search?q=${encodeURIComponent(search)}`); }}
                        className="block mt-2 mx-auto text-primary font-medium"
                      >
                        Дэлгэрэнгүй хайх →
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop: two-column */}
                <div className="hidden sm:flex">
                  <div className="w-52 border-r border-gray-100 p-4 bg-gray-50/50 shrink-0">
                    <div className="mb-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Ангилалууд</h4>
                      <div className="space-y-1">
                        {categoriesList.map(([key, label]) => (
                          <Link key={key} href={`/s/${key}`} onClick={() => setShowSuggestions(false)}
                            className="flex items-center justify-between px-2 py-1.5 text-sm text-gray-700 hover:bg-white hover:text-primary rounded-lg transition-colors">
                            <span>{label}</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">{search} - бүтээгдэхүүн</h4>
                    {searchSuggestions.length > 0 ? (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          {searchSuggestions.map((product) => (
                            <div key={product.id} onClick={() => handleSuggestionClick(product.slug)}
                              className="border border-gray-100 rounded-lg p-2 hover:shadow-sm transition-all cursor-pointer group">
                              <div className="aspect-square bg-gray-50 rounded-md flex items-center justify-center mb-2 relative overflow-hidden">
                                {product.image
                                  ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  : <div className="text-2xl">{CATEGORY_ICONS[product.category]}</div>
                                }
                              </div>
                              <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">{product.brand}</p>
                              <h5 className="text-[11px] font-medium text-gray-800 line-clamp-2 mb-1.5 group-hover:text-primary transition-colors h-7">{product.name}</h5>
                              <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-xs font-black text-gray-900">{formatPrice(product.price)}</span>
                              </div>
                              <button onClick={(e) => handleAddToCart(e, product)}
                                className="w-full bg-primary hover:bg-primary-dark text-white text-[10px] font-bold py-1 rounded transition-colors">
                                Сагсанд нэмэх
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-center">
                          <button onClick={() => { setShowSuggestions(false); router.push(`/search?q=${encodeURIComponent(search)}`); }}
                            className="text-sm text-primary font-bold hover:underline">
                            Бүх бүтээгдэхүүнийг үзэх {searchSuggestions.length > 0 ? `(${searchSuggestions.length})` : ''}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">&ldquo;{search}&rdquo; олдсонгүй</p>
                        <button onClick={() => { setShowSuggestions(false); router.push(`/search?q=${encodeURIComponent(search)}`); }}
                          className="mt-2 text-sm text-primary font-medium hover:underline">
                          Дэлгэрэнгүй хайх →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nav Icons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/compare" className="hidden md:flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="text-[10px] mt-0.5">Харьцуулах</span>
            </Link>

            <Link href="/checkout" className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors relative">
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {cartCount > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                ) : null}
              </div>
              <span className="hidden sm:block text-[10px] mt-0.5">Сагс</span>
            </Link>

            {/* Toast Notification */}
            {showToast && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]">
                <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-bounce">
                  Бүтээгдэхүүнийг сагсанд нэмлээ! 🛒
                </div>
              </div>
            )}

            {user ? (
              <div className="relative hidden md:block">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex flex-col items-center text-primary transition-colors">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <span className="text-[10px] mt-0.5">{user.firstName}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-bold text-gray-900">{user.lastName} {user.firstName}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                      <Link href="/account" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-primary">👤 Хувийн мэдээлэл</Link>
                      <Link href="/account/wishlists" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-primary">❤️ Хадгалсан</Link>
                      <Link href="/checkout" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-primary">🛒 Миний сагс</Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">🚪 Гарах</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/account" className="hidden md:flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-[10px] mt-0.5">Бүртгэл</span>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-700"
              aria-label="Цэс нээх"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu — desktop only */}
      <div className="hidden lg:block">
        <MegaMenu />
      </div>

      {/* Mobile category nav strip */}
      <div className="lg:hidden bg-primary text-white">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
          {categories.map(cat => (
            <Link key={cat.href} href={cat.href}
              className="shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap hover:bg-primary-dark transition-colors">
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile drawer menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-[min(20rem,90vw)] bg-white shadow-2xl overflow-y-auto">
            <div className="p-4 bg-primary text-white font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                Бүх ангилал
              </span>
              <button onClick={() => setMenuOpen(false)} className="p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {categories.map(cat => (
              <Link key={cat.href} href={cat.href} onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100">
                {cat.label}
              </Link>
            ))}
            <div className="p-2 bg-gray-50 text-xs text-gray-500 font-medium">Онцлох ангилал</div>
            <Link href="/grocery" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100"><span>🛒</span> Grocery &amp; Supermarket</Link>
            <Link href="/fashion" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100"><span>👕</span> Fashion &amp; Clothing</Link>
            <Link href="/electronics" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100"><span>💻</span> Electronics</Link>
            <Link href="/beauty" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100"><span>💄</span> Beauty &amp; Personal Care</Link>
            <Link href="/home-living" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100"><span>🏠</span> Home &amp; Living</Link>
            {/* Auth links in drawer */}
            <div className="p-2 bg-gray-50 text-xs text-gray-500 font-medium mt-2">Бүртгэл</div>
            <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100"><span>👤</span> Хувийн мэдээлэл</Link>
            <Link href="/account/wishlists" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100"><span>❤️</span> Хадгалсан</Link>
          </div>
        </>
      )}
    </header>
  );
}
