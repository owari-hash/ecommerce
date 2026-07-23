'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { readCompare, writeCompare, type CompareItem } from '../lib/compareStore';
import { useTenantHref } from '../lib/useTenantHref';

export default function CompareBar() {
  const tenantHref = useTenantHref();
  const [items, setItems] = useState<CompareItem[]>([]);

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

  if (items.length === 0) return null;

  const remove = (id: string) => {
    const next = readCompare().filter((x) => x.id !== id);
    writeCompare(next);
  };

  return (
    <div className="compare-bar-container fixed left-0 right-0 bottom-16 md:bottom-0 z-[60] animate-in slide-in-from-bottom-4 duration-200">
      <div className="max-w-7xl mx-auto px-3 pb-3">
        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Label */}
            <span className="hidden sm:block text-xs font-black uppercase tracking-widest text-gray-400 shrink-0">
              Харьцуулах
            </span>

            {/* Product thumbnails */}
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {items.map((item) => (
                <div key={item.id} className="relative shrink-0 group/thumb">
                  <div className="relative w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" unoptimized={true} />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300" strokeWidth={1.4} />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`${item.title} устгах`}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-700 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black leading-none transition-colors"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/thumb:block pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap max-w-[140px] truncate">
                      {item.title}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-200 shrink-0 flex items-center justify-center text-gray-300 text-xs"
                >
                  +
                </div>
              ))}

              {/* Selected count on mobile */}
              <span className="sm:hidden text-xs font-bold text-gray-500 shrink-0 ml-1">
                {items.length} бараа
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => writeCompare([])}
                className="hidden sm:block text-xs text-gray-400 hover:text-gray-700 font-semibold transition-colors"
              >
                Цэвэрлэх
              </button>
              <Link
                href={tenantHref('/compare')}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Харьцуулах</span>
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-black">
                  {items.length}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
