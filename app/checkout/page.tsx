import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Сагс | Turbotech' };

export default function CheckoutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Сагс</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Худалдан авалтын сагс</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="text-7xl mb-4 opacity-40">🛒</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Таны сагс хоосон байна</h2>
        <p className="text-gray-400 mb-6 text-sm">Барааны жагсаалтаас хүссэн барааг сагсанд нэмнэ үү</p>
        <Link href="/" className="inline-block bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold px-8 py-3 rounded-xl transition-colors">
          Дэлгүүрлэх
        </Link>
      </div>
    </div>
  );
}
