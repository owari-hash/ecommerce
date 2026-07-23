import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <SearchX className="w-20 h-20 mx-auto mb-6 text-gray-300" strokeWidth={1.4} />
        <h1 className="text-6xl font-black text-[#1565C0] mb-3">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Хуудас олдсонгүй</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Таны хайж буй хуудас байхгүй байна. Алдаатай хаяг оруулсан эсвэл хуудас устгагдсан байж болно.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/" className="bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold px-8 py-3 rounded-xl transition-colors">
            Нүүр хуудас
          </Link>
          <Link href="/brands" className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-8 py-3 rounded-xl border border-gray-200 transition-colors">
            Брэндүүд
          </Link>
        </div>
      </div>
    </div>
  );
}
