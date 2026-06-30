'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTenant } from '../lib/TenantContext';
import { useTenantHref } from '../lib/useTenantHref';
import { resolveUploadUrl } from '../lib/apiClient';

export type SubCategory = {
  label: string;
  href: string;
};

export type MainCategory = {
  imageUrl?: string | null;
  emoji?: string | null;
  label: string;
  href: string;
  subcategories: SubCategory[];
  featured?: {
    image: string;
    title: string;
    href: string;
  };
};

function cleanImageUrl(url: string | undefined): string {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/^(Оруулах|оруулах|[Oo]ruulah|[Uu]pload)/g, '').trim();
  return cleaned;
}

function resolveCategoryIcon(image: string | undefined) {
  if (!image) return { imageUrl: null, emoji: null };
  const cleaned = cleanImageUrl(image);
  if (!cleaned) return { imageUrl: null, emoji: null };
  if (cleaned.length <= 4 && !cleaned.includes('/') && !cleaned.includes('.')) {
    return { imageUrl: null, emoji: cleaned };
  }
  return { imageUrl: resolveUploadUrl(cleaned) || null, emoji: null };
}

export default function MegaMenu() {
  const tenant = useTenant();
  const { tenantId, contact } = tenant;
  const promo = tenant.promo;
  const tenantHref = useTenantHref();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [megaCategories, setMegaCategories] = useState<MainCategory[]>([]);

  useEffect(() => {
    fetch(`/api/categories/public?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((body) => {
        if (!body?.data?.length) return;
        const all = body.data as {
          id: string;
          name: string;
          slug: string;
          parentId: string | null;
          image: string;
        }[];
        const roots = all.filter((c) => !c.parentId);
        setMegaCategories(
          roots.map((root) => {
            const iconResolved = resolveCategoryIcon(root.image);
            return {
              imageUrl: iconResolved.imageUrl,
              emoji: iconResolved.emoji,
              label: root.name,
              href: tenantHref(`/${root.slug}`),
              subcategories: all
                .filter((c) => c.parentId === root.id)
                .map((child) => ({
                  label: child.name,
                  href: tenantHref(`/${root.slug}/${child.slug}`),
                })),
              featured: root.image
                ? { image: resolveUploadUrl(root.image), title: root.name, href: tenantHref(`/${root.slug}`) }
                : undefined,
            };
          })
        );
      })
      .catch(console.error);
  }, [tenantId]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setActiveCategory(null);
    setTimeout(() => setIsOpen(false), 200);
  };

  if (megaCategories.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={handleClose}
    >
      {/* Main Categories Nav */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <button
              className="relative flex items-center gap-2 px-3 py-2.5 font-bold hover:bg-primary-dark transition-colors whitespace-nowrap text-sm group"
              onMouseEnter={() => setActiveCategory('all')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Бүх ангилал
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-[calc(100%-16px)] transition-all duration-300 rounded-full" />
            </button>

            {megaCategories.slice(0, 6).map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="relative px-3 py-2.5 font-medium hover:bg-primary-dark transition-colors whitespace-nowrap text-sm group"
                onMouseEnter={() => setActiveCategory(cat.label)}
              >
                {cat.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-[calc(100%-16px)] transition-all duration-300 rounded-full" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-50 transition-all duration-200 ease-out origin-top ${
            isVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-2 scale-[0.98]'
          }`}
          style={{
            maxHeight: 'calc(100vh - 100px)',
            pointerEvents: isVisible ? 'auto' : 'none',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex gap-6">
              {/* Left Sidebar */}
              <div className="w-64 shrink-0 bg-gradient-to-b from-gray-50/50 to-transparent rounded-xl p-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Ангилал
                </h3>
                <div className="space-y-1 max-h-[420px] overflow-y-auto scrollbar-thin">
                  {megaCategories.map((cat, idx) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm group overflow-hidden ${
                        activeCategory === cat.label
                          ? 'bg-white shadow-sm text-primary font-medium ring-1 ring-primary/20'
                          : 'hover:bg-white hover:shadow-sm text-gray-700'
                      } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                      style={{
                        transitionDelay: isVisible ? `${idx * 15}ms` : '0ms',
                        transitionProperty: 'opacity, transform, background-color, box-shadow',
                      }}
                      onMouseEnter={() => setActiveCategory(cat.label)}
                    >
                      {cat.imageUrl ? (
                        <div className="w-5 h-5 relative shrink-0 overflow-hidden rounded-md group-hover:scale-110 transition-transform duration-200">
                          <Image src={cat.imageUrl} alt={cat.label} fill className="object-cover" sizes="20px" />
                        </div>
                      ) : cat.emoji ? (
                        <span className="text-xl group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      )}
                      <span className="truncate">{cat.label}</span>
                      <svg
                        className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-40 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Middle – Subcategories */}
              <div className="flex-1 min-w-0 max-h-[440px] overflow-y-auto scrollbar-thin px-2">
                {activeCategory && activeCategory !== 'all' && (
                  <>
                    {megaCategories
                      .filter((cat) => cat.label === activeCategory)
                      .map((cat) => (
                        <div
                          key={cat.label}
                          className={`transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                          style={{ transitionDelay: '50ms' }}
                        >
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden relative shrink-0">
                              {cat.imageUrl ? (
                                <Image src={cat.imageUrl} alt={cat.label} fill className="object-cover" sizes="40px" />
                              ) : cat.emoji ? (
                                <span className="text-2xl">{cat.emoji}</span>
                              ) : (
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h3 className="font-black text-gray-900 text-lg">{cat.label}</h3>
                              <p className="text-xs text-gray-500">{cat.subcategories.length} дэд ангилал</p>
                            </div>
                            <Link
                              href={cat.href}
                              className="ml-auto text-sm text-primary hover:underline font-medium flex items-center gap-1 group"
                            >
                              Бүгд
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>

                          {cat.subcategories.length > 0 ? (
                            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                              {cat.subcategories.map((sub, idx) => (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  className={`group flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-all duration-150 ${
                                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                                  }`}
                                  style={{
                                    transitionDelay: isVisible ? `${50 + idx * 20}ms` : '0ms',
                                    transitionProperty: 'opacity, transform, color, background-color',
                                  }}
                                >
                                  <span className="w-2 h-2 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 group-hover:from-primary group-hover:to-primary-light transition-all" />
                                  <span className="truncate">{sub.label}</span>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">Дэд ангилал байхгүй</p>
                          )}
                        </div>
                      ))}
                  </>
                )}

                {(!activeCategory || activeCategory === 'all') && (
                  <div
                    className={`transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                    style={{ transitionDelay: '30ms' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="font-black text-gray-900 text-lg">Бүх ангилал</h3>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {megaCategories.map((cat, idx) => (
                        <Link
                          key={cat.label}
                          href={cat.href}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-200 group bg-white ${
                            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                          }`}
                          style={{
                            transitionDelay: isVisible ? `${idx * 25}ms` : '0ms',
                            transitionProperty: 'opacity, transform, border-color, box-shadow',
                          }}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden relative border border-gray-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            {cat.imageUrl ? (
                              <Image src={cat.imageUrl} alt={cat.label} fill className="object-cover" sizes="48px" />
                            ) : cat.emoji ? (
                              <span className="text-3xl">{cat.emoji}</span>
                            ) : (
                              <svg className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs text-gray-700 text-center leading-tight font-medium">
                            {cat.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div
                className={`w-56 shrink-0 space-y-4 transition-all duration-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'}`}
              >
                {activeCategory && activeCategory !== 'all' && (
                  <>
                    {megaCategories
                      .filter((cat) => cat.label === activeCategory && cat.featured)
                      .map((cat) => (
                        <Link
                          key={`featured-${cat.label}`}
                          href={cat.featured!.href}
                          className="block rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                          style={{ transitionDelay: isVisible ? '100ms' : '0ms' }}
                        >
                          <div className="h-32 overflow-hidden relative">
                            <Image
                              src={cat.featured!.image}
                              alt={cat.featured!.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="224px"
                            />
                          </div>
                          <div className="p-3 bg-gradient-to-r from-primary/5 via-white to-primary/5">
                            <p className="text-[10px] text-primary font-black uppercase tracking-wider mb-1">⭐ Онцлох</p>
                            <p className="text-sm font-bold text-gray-900 line-clamp-2">{cat.featured!.title}</p>
                          </div>
                        </Link>
                      ))}
                  </>
                )}

                {(promo?.visible ?? true) && (
                  <div
                    className={`rounded-xl overflow-hidden border border-gray-100 bg-gradient-to-br from-primary via-primary to-primary-dark text-white p-4 relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                    style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <p className="text-[10px] font-black uppercase opacity-80 tracking-wider">{promo?.label ?? 'Хязгаартай'}</p>
                      <p className="text-2xl font-black mt-1">{promo?.discount ?? '30% OFF'}</p>
                      {promo?.subtitle && <p className="text-sm opacity-90 mb-3">{promo.subtitle}</p>}
                      <Link
                        href={tenantHref(promo?.href ?? '/')}
                        className="inline-flex items-center gap-1 bg-white text-primary px-4 py-2 rounded-lg text-sm font-black hover:bg-gray-100 transition-colors shadow-lg mt-3"
                      >
                        Харах
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}

                <div
                  className={`rounded-xl border border-gray-100 bg-gray-50 p-3 transition-all duration-300 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                  style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}
                >
                  <p className="text-xs font-bold text-gray-700 mb-2">Тусламж хэрэгтэй юу ?</p>
                  <a href={`tel:${contact?.phone ?? ''}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {contact?.phone ?? '—'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
