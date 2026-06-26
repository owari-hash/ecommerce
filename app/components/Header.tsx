'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getCartCount, addToCart } from '../lib/cartStore';
import { readAuth, logout, type User } from '../lib/authStore';
import { formatPrice } from '../lib/mockCatalog';
import MegaMenu from './MegaMenu';
import { useTenant } from '../lib/TenantContext';
import { useTenantHref } from '../lib/useTenantHref';
import { resolveUploadUrl } from '../lib/apiClient';

type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image?: string;
  stock?: number;
};

export default function Header() {
  const { branding, contact, tenantId } = useTenant();
  const tenantHref = useTenantHref();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(() => getCartCount());
  const [user, setUser] = useState<User | null>(() => readAuth());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [mobileDebouncedSearch, setMobileDebouncedSearch] = useState('');
  const [categories, setCategories] = useState<{ label: string; href: string }[]>([]);
  const [apiProducts, setApiProducts] = useState<SearchProduct[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onCartChange = () => setCartCount(getCartCount());
    const onAuthChange = () => setUser(readAuth());
    window.addEventListener('cart:changed', onCartChange);
    window.addEventListener('auth:changed', onAuthChange);
    return () => {
      window.removeEventListener('cart:changed', onCartChange);
      window.removeEventListener('auth:changed', onAuthChange);
    };
  }, []);


  useEffect(() => {
    fetch(`/api/categories/public?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((body) => {
        if (!body?.data?.length) return;
        const roots = (body.data as { name: string; slug: string; parentId: string | null }[])
          .filter((c) => !c.parentId)
          .map((c) => ({ label: c.name, href: tenantHref(`/${c.slug}`) }));
        setCategories(roots);
      })
      .catch(console.error);
  }, [tenantId, tenantHref]);

  useEffect(() => {
    fetch(`/api/products/public?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((body) => {
        if (!body?.data) return;
        setApiProducts(
          body.data.map((p: any): SearchProduct => ({
            id: p.id,
            slug: p.slug || p.id,
            name: p.name,
            brand: (p.brandId && p.brandId !== 'br1') ? p.brandId : (branding?.name ?? ''),
            price: p.salePrice || p.price,
            oldPrice: p.salePrice ? p.price : undefined,
            image: resolveUploadUrl(p.images?.[0]),
            stock: p.stock ?? 0,
          }))
        );
      })
      .catch(console.error);
  }, [tenantId]);

  useEffect(() => {
    if (showMobileSearch) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setMobileSearch('');
      setMobileDebouncedSearch('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMobileSearch]);

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

  const handleMobileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMobileSearch(value);
    if (mobileSearchTimeoutRef.current) clearTimeout(mobileSearchTimeoutRef.current);
    mobileSearchTimeoutRef.current = setTimeout(() => setMobileDebouncedSearch(value), 150);
  };

  const handleMobileSearchSubmit = () => {
    if (mobileSearch.trim()) {
      setShowMobileSearch(false);
      router.push(`/search?q=${encodeURIComponent(mobileSearch.trim())}`);
    }
  };

  const searchSuggestions = useMemo(() => {
    if (debouncedSearch.trim().length < 1) return [];
    const query = debouncedSearch.toLowerCase();
    return apiProducts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [debouncedSearch, apiProducts]);

  const mobileSuggestions = useMemo(() => {
    if (mobileDebouncedSearch.trim().length < 1) return [];
    const query = mobileDebouncedSearch.toLowerCase();
    return apiProducts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [mobileDebouncedSearch, apiProducts]);

  const filteredBrands = useMemo(() => {
    if (!mobileDebouncedSearch.trim()) return [];
    const query = mobileDebouncedSearch.toLowerCase();
    const brands = [...new Set(apiProducts.map(p => p.brand))].sort();
    return brands.filter(brand => brand.toLowerCase().includes(query)).slice(0, 4);
  }, [mobileDebouncedSearch, apiProducts]);

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    setSearch('');
    router.push(tenantHref(`/product/${slug}`));
  };

  const handleAddToCart = (e: React.MouseEvent, product: SearchProduct) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      icon: '📦',
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
    return categories.slice(0, 5);
  }, [categories]);

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
      if (mobileSearchTimeoutRef.current) clearTimeout(mobileSearchTimeoutRef.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Bar – hidden on mobile */}
      <div className="hidden sm:block bg-[#0a1628] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href={`tel:${contact?.phone}`} className="hover:text-red-300 transition-colors flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              {contact?.phone}
            </a>
            <a href={`mailto:${contact?.email}`} className="hover:text-red-300 transition-colors flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {contact?.email}
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
          <Link href={tenantHref('/')} className="shrink-0 flex items-center gap-2">
            {branding.logo ? (
              <Image src={branding.logo} alt={branding.name || "Logo"} width={200} height={40} className="h-8 sm:h-10 w-auto object-contain max-w-[200px]" style={{ width: 'auto' }} />
            ) : (
              <Image src="/logo.png" alt={branding.name || "Logo"} width={200} height={40} className="h-8 sm:h-10 w-auto object-contain" style={{ width: 'auto' }} />
            )}
            {!branding.logo && branding.name && <span className="font-bold text-lg text-primary">{branding.name}</span>}
          </Link>

          {/* Mobile: search icon triggers full-screen modal */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="sm:hidden flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Бараа хайх...
          </button>

          {/* Desktop: full search bar + dropdown */}
          <div ref={searchRef} className="hidden sm:flex flex-1 min-w-0 relative">
            <form onSubmit={handleSearch} className="flex w-full">
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

            {/* Desktop suggestions dropdown */}
            {showSuggestions && search.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex">
                  <div className="w-52 border-r border-gray-100 p-4 bg-gray-50/50 shrink-0">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Ангилалууд</h4>
                    <div className="space-y-1">
                      {categoriesList.map((cat) => (
                        <Link key={cat.href} href={cat.href} onClick={() => setShowSuggestions(false)}
                          className="flex items-center justify-between px-2 py-1.5 text-sm text-gray-700 hover:bg-white hover:text-primary rounded-lg transition-colors">
                          <span>{cat.label}</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">{search} - бүтээгдэхүүн</h4>
                    {searchSuggestions.length > 0 ? (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          {searchSuggestions.map((product) => (
                            <div key={product.id} onClick={() => product.stock !== 0 && handleSuggestionClick(product.slug)}
                              className={`border border-gray-100 rounded-lg p-2 transition-all group ${product.stock === 0 ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'}`}>
                              <div className="relative aspect-square bg-gray-50 rounded-md flex items-center justify-center mb-2 overflow-hidden">
                                {product.image
                                  ? <Image src={product.image} alt={product.name} fill className={`object-cover ${product.stock === 0 ? 'grayscale opacity-60' : ''}`} sizes="120px" unoptimized />
                                  : <div className="text-2xl">📦</div>
                                }
                                {product.stock === 0 && (
                                  <span className="absolute top-1 left-1 bg-gray-800 text-white text-[8px] font-black px-1 py-0.5 rounded leading-none shadow uppercase">
                                    Дууссан
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">{product.brand}</p>
                              <h5 className="text-[11px] font-medium text-gray-800 line-clamp-2 mb-1.5 group-hover:text-primary transition-colors h-7">{product.name}</h5>
                              <span className="text-xs font-black text-gray-900">{formatPrice(product.price)}</span>
                              {product.stock === 0 ? (
                                <button disabled
                                  className="w-full mt-1 bg-gray-300 text-gray-500 text-[10px] font-bold py-1 rounded cursor-not-allowed">
                                  Дууссан
                                </button>
                              ) : (
                                <button onClick={(e) => handleAddToCart(e, product)}
                                  className="w-full mt-1 bg-primary hover:bg-primary-dark text-white text-[10px] font-bold py-1 rounded transition-colors">
                                  Сагсанд нэмэх
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-center">
                          <button onClick={() => { setShowSuggestions(false); router.push(`/search?q=${encodeURIComponent(search)}`); }}
                            className="text-sm text-primary font-bold hover:underline">
                            Бүх бүтээгдэхүүнийг үзэх ({searchSuggestions.length})
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">&ldquo;{search}&rdquo; олдсонгүй</p>
                        <button onClick={() => { setShowSuggestions(false); router.push(`/search?q=${encodeURIComponent(search)}`); }}
                          className="mt-2 text-sm text-primary font-medium hover:underline">
                          Дэлгэрэнгүй хайх 
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
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 z-[100] w-[min(90vw,340px)] pointer-events-none">
                <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                  <span className="shrink-0 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-base">🛒</span>
                  <span className="text-sm font-semibold flex-1 truncate">Сагсанд нэмэгдлээ!</span>
                  <span className="text-green-400 shrink-0">✓</span>
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
            <div className="p-2 bg-gray-50 text-xs text-gray-500 font-medium mt-2">Бүртгэл</div>
            <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100"><span>👤</span> Хувийн мэдээлэл</Link>
            <Link href="/account/wishlists" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-primary border-b border-gray-100"><span>❤️</span> Хадгалсан</Link>
          </div>
        </>
      )}

      {/* Mobile full-screen search modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col sm:hidden">
          {/* Top bar: back · input · clear */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white shrink-0">
            <button
              onClick={() => setShowMobileSearch(false)}
              className="p-1 text-gray-600 shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={mobileInputRef}
                type="text"
                value={mobileSearch}
                onChange={handleMobileSearchChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleMobileSearchSubmit(); }}
                placeholder="Хайлт..."
                className="flex-1 text-sm focus:outline-none bg-transparent"
              />
              {mobileSearch && (
                <button
                  onClick={() => { setMobileSearch(''); setMobileDebouncedSearch(''); }}
                  className="text-gray-400 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {!mobileSearch.trim() ? (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm">Хайх үгээ оруулна уу</p>
              </div>
            ) : (
              <>
                {/* Section 1: Санал болгох */}
                {mobileSuggestions.length > 0 && (
                  <div className="border-b border-gray-100">
                    <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400">Санал болгох</p>
                    {mobileSuggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => { setShowMobileSearch(false); router.push(tenantHref(`/product/${product.slug}`)); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left active:bg-gray-50"
                      >
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{product.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Section 2: [query] - брэндүүд */}
                {filteredBrands.length > 0 && (
                  <div className="border-b border-gray-100">
                    <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400">{mobileSearch} - брэндүүд</p>
                    {filteredBrands.map((brand) => (
                      <Link
                        key={brand}
                        href={`/brands/${brand.toLowerCase()}`}
                        onClick={() => setShowMobileSearch(false)}
                        className="flex items-center gap-3 px-4 py-3 active:bg-gray-50"
                      >
                        <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-gray-600 text-center leading-tight px-0.5">
                            {brand.slice(0, 5).toUpperCase()}
                          </span>
                        </div>
                        <span className="flex-1 text-sm font-bold text-gray-800 uppercase tracking-wide">{brand}</span>
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Section 3: [query] - бүтээгдэхүүн (horizontal scroll) */}
                {mobileSuggestions.length > 0 && (
                  <div className="pb-6">
                    <p className="px-4 pt-4 pb-3 text-xs font-semibold text-gray-400">{mobileSearch} - бүтээгдэхүүн</p>
                    <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
                      {mobileSuggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={product.stock === 0 ? '#' : tenantHref(`/product/${product.slug}`)}
                          onClick={(e) => { if (product.stock === 0) { e.preventDefault(); } else { setShowMobileSearch(false); } }}
                          className={`shrink-0 w-36 bg-white rounded-xl border border-gray-200 overflow-hidden active:opacity-75 ${product.stock === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          <div className="h-28 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill className={`object-cover ${product.stock === 0 ? 'grayscale opacity-60' : ''}`} sizes="144px" unoptimized />
                            ) : (
                              <span className="text-4xl">📦</span>
                            )}
                            <div className="absolute top-1.5 left-1.5 bg-white/90 rounded px-1 py-0.5">
                              <span className="text-[9px] font-black text-gray-700">{product.brand}</span>
                            </div>
                            {product.stock === 0 && (
                              <span className="absolute top-1.5 right-1.5 bg-gray-800 text-white text-[8px] font-black px-1 py-0.5 rounded leading-none shadow uppercase">
                                Дууссан
                              </span>
                            )}
                          </div>
                          <div className="p-2">
                            <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight mb-1" style={{ minHeight: '2rem' }}>
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 mb-2">{product.brand}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-gray-900">{formatPrice(product.price)}</span>
                              {product.stock === 0 ? (
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Дууссан</span>
                              ) : (
                                <button
                                  onClick={(e) => { e.preventDefault(); handleAddToCart(e, product); }}
                                  className="bg-primary hover:bg-primary-dark text-white w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {mobileSuggestions.length === 0 && filteredBrands.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-sm">&ldquo;{mobileSearch}&rdquo; олдсонгүй</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
