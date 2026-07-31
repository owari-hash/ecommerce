'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Хуудас ачаалахад алдаа гарлаа</h2>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        Уучлаарай, түр зуурын алдаа гарлаа. Та хуудсаа дахин ачаална уу.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Дахин оролдох
        </button>
        <Link
          href="/"
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Нүүр хуудас
        </Link>
      </div>
    </div>
  );
}
