'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCartCount } from '../lib/cartStore';
import { readAuth, type User } from '../lib/authStore';

function Item({
  href,
  label,
  icon,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 py-1.5 flex-1 transition-colors ${
        active ? 'text-primary' : 'text-gray-400'
      }`}
    >
      <span className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${active ? 'bg-primary/10' : ''}`}>
        <span className="w-5 h-5">{icon}</span>
        {badge !== undefined && badge > 0 ? (
          <span className="absolute -top-1 -right-0.5 min-w-[16px] h-[16px] bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </span>
      <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
    </Link>
  );
}

export default function MobileBottomNav() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<User | null>(() => readAuth());

  useEffect(() => {
    setCartCount(getCartCount());
    const onCartChange = () => setCartCount(getCartCount());
    window.addEventListener('cart:changed', onCartChange);
    const onAuthChange = () => setUser(readAuth());
    window.addEventListener('auth:changed', onAuthChange);
    return () => {
      window.removeEventListener('cart:changed', onCartChange);
      window.removeEventListener('auth:changed', onAuthChange);
    };
  }, []);

  return (
    <nav className="md:hidden fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <Item
            href="/"
            label="Нүүр"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="transition-all duration-200">
                <path
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z"
                />
              </svg>
            }
          />
          <Item
            href="/categories"
            label="Ангилал"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            }
          />
          {/* Wishlist ("Хадгалсан") disabled for now — feature isn't implemented yet */}
          {/* <Item
            href="/account/wishlists"
            label="Хадгалсан"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            }
          /> */}
          <Item
            href="/checkout"
            label="Сагс"
            badge={cartCount}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h15l-1.5 9h-13L5 3H3m6 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                />
              </svg>
            }
          />
          <Item
            href="/account"
            label={user ? 'Профайл' : 'Бүртгэл'}
            icon={
              user?.avatar ? (
                <Image src={user.avatar} alt="" width={20} height={20} className="w-full h-full rounded-full object-cover" unoptimized referrerPolicy="no-referrer" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 21a8 8 0 1 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                  />
                </svg>
              )
            }
          />
      </div>
    </nav>
  );
}

