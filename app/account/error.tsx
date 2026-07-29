'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Account page error:', error);
  }, [error]);

  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <AlertCircle className="w-8 h-8" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Хуудас ачаалахад алдаа гарлаа</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Түр хүлээгээд дахин оролдоно уу.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Дахин ачаалах
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Нүүр
          </Link>
        </div>
      </div>
    </div>
  );
}
