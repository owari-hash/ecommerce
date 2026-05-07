import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug.toUpperCase()} | Брэнд | Turbotech` };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brandName = slug.toUpperCase().replace(/-/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <Link href="/brands" className="hover:text-[#1565C0]">Брэндүүд</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{brandName}</span>
      </nav>

      {/* Brand header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-3xl font-black text-[#1565C0] flex-shrink-0">
          {slug.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-800 mb-1">{brandName}</h1>
          <p className="text-gray-500 text-sm">Turbotech дэлгүүрт боломжтой {brandName} брэндийн бүтээгдэхүүнүүд</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="text-7xl mb-4 opacity-40">📦</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">{brandName} брэндийн бараанууд</h2>
        <p className="text-gray-400 mb-6 text-sm">Одоогоор бараа байхгүй байна. Удахгүй нэмэгдэнэ.</p>
        <Link href="/brands" className="inline-block bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold px-8 py-3 rounded-xl transition-colors">
          Бүх брэнд харах
        </Link>
      </div>
    </div>
  );
}
