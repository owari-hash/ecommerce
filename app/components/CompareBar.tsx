'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { readCompare, writeCompare, type CompareItem } from '../lib/compareStore';

const MAX_ITEMS = 4;

export default function CompareBar() {
  const [items, setItems] = useState<CompareItem[]>(() =>
    typeof window === 'undefined' ? [] : readCompare(),
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key) setItems(readCompare());
    };
    const onCompareChanged = () => setItems(readCompare());
    window.addEventListener('storage', onStorage);
    window.addEventListener('compare:changed', onCompareChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('compare:changed', onCompareChanged);
    };
  }, []);

  const slots = useMemo(() => {
    const filled = items.slice(0, MAX_ITEMS);
    while (filled.length < MAX_ITEMS) {
      filled.push({ id: `__empty_${filled.length}`, title: 'placeholder for comparison item' });
    }
    return filled;
  }, [items]);

  const count = items.length;

  return (
    <div className="fixed left-0 right-0 bottom-14 md:bottom-0 z-50">
      <div className="max-w-7xl mx-auto px-3 pb-3">
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-800">
              Сонгосон ({count} бүтээгдэхүүн)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setItems([]);
                  writeCompare([]);
                }}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Бүгдийг устгах
              </button>
              <Link
                href="/compare"
                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3 py-2 rounded-xl"
              >
                Харьцуулах
              </Link>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {slots.map((x) => (
                <div
                  key={x.id}
                  className="border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs text-gray-500 min-h-[56px] flex items-center justify-center text-center"
                >
                  {x.title}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setItems([]);
                  writeCompare([]);
                }}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Цэвэрлэх
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

