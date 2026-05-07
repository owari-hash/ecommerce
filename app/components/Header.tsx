'use client';
import Link from 'next/link';
import { useState } from 'react';

const categories = [
  { label: 'Зөөврийн компьютер', href: '/s/laptop' },
  { label: 'Суурин компьютер', href: '/s/computer' },
  { label: 'Ухаалаг төхөөрөмж', href: '/s/smartphone-and-tablet' },
  { label: 'Консоль', href: '/s/console' },
  { label: 'Аудио төхөөрөмж', href: '/s/audio-equipment' },
  { label: 'Гэр ахуй', href: '/s/home' },
  { label: 'Дагалдах хэрэгсэл', href: '/s/accessories' },
  { label: 'Брэнд', href: '/brands' },
];

export default function Header() {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Bar */}
      <div className="bg-[#0a1628] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <a href="tel:77777734" className="hover:text-blue-300 transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              7777-7734
            </a>
            <a href="tel:77777754" className="hover:text-blue-300 transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
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
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col leading-tight">
            <span className="text-2xl font-black text-[#1565C0] tracking-tight">
              ИХ <span className="text-orange-500">НАЯД</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 flex max-w-2xl">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Бараа, брэнд хайх..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
            />
            <button className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-5 py-2.5 rounded-r-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>

          {/* Nav Icons */}
          <div className="flex items-center gap-5 ml-auto">
            <Link href="/compare" className="flex flex-col items-center text-gray-500 hover:text-[#1565C0] transition-colors group">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="text-[10px] mt-0.5">Харьцуулах</span>
            </Link>
            <Link href="/account/wishlists" className="flex flex-col items-center text-gray-500 hover:text-[#1565C0] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <span className="text-[10px] mt-0.5">Хадгалсан</span>
            </Link>
            <Link href="/checkout" className="flex flex-col items-center text-gray-500 hover:text-[#1565C0] transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span className="text-[10px] mt-0.5">Сагс</span>
            </Link>
            <Link href="/account" className="flex flex-col items-center text-gray-500 hover:text-[#1565C0] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-[10px] mt-0.5">Бүртгэл</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-gray-700 ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {/* Category Nav */}
      <nav className="bg-[#1565C0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                className="text-white text-sm font-medium px-4 py-3 hover:bg-[#0D47A1] transition-colors whitespace-nowrap flex-shrink-0 border-r border-blue-700 last:border-r-0"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b shadow-lg">
          {categories.map(cat => (
            <Link key={cat.href} href={cat.href} onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1565C0] border-b border-gray-100">
              {cat.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
