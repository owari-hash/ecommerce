'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { readCompare, writeCompare, type CompareItem } from '../lib/compareStore';

const MAX_ITEMS = 4;

export default function ComparePageClient() {
  const [items, setItems] = useState<CompareItem[]>(() =>
    typeof window === 'undefined' ? [] : readCompare(),
  );

  useEffect(() => {
    const onChanged = () => setItems(readCompare());
    window.addEventListener('compare:changed', onChanged);
    window.addEventListener('storage', onChanged);
    return () => {
      window.removeEventListener('compare:changed', onChanged);
      window.removeEventListener('storage', onChanged);
    };
  }, []);

  const slots = useMemo(() => {
    const filled = items.slice(0, MAX_ITEMS);
    while (filled.length < MAX_ITEMS) filled.push({ id: `__empty_${filled.length}`, title: 'placeholder for comparison item' });
    return filled;
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">
          Нүүр
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Харьцуулах</span>
      </nav>

      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-black text-gray-800">Харьцуулах</h1>
        <button
          type="button"
          className="text-sm font-bold text-gray-600 hover:text-gray-900"
          onClick={() => {
            setItems([]);
            writeCompare([]);
          }}
        >
          Бүгдийг устгах
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-7xl mb-4 opacity-40">⚖️</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Харьцуулах бараа байхгүй байна</h2>
          <p className="text-gray-400 mb-6 text-sm">Барааны хуудаснаас харьцуулах барааг нэмнэ үү</p>
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Бараа хайх
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {slots.map((x) => (
            <div key={x.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-36 bg-gray-50 flex items-center justify-center text-5xl opacity-50">📦</div>
              <div className="p-4">
                <div className="text-sm font-black text-gray-900">{x.title}</div>
                {x.slug && (
                  <Link href={`/product/${x.slug}`} className="text-sm font-bold text-primary hover:underline mt-2 inline-block">
                    Дэлгэрэнгүй →
                  </Link>
                )}
                {x.slug && (
                  <button
                    type="button"
                    className="mt-3 text-xs font-bold text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      const next = readCompare().filter((it) => it.id !== x.id);
                      setItems(next);
                      writeCompare(next);
                    }}
                  >
                    Устгах
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

