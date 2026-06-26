import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Брэндүүд' };

interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
}

async function fetchBrands(): Promise<Brand[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    const res = await fetch(`${apiUrl}/api/brands?status=active&limit=200`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.brands ?? data.data ?? [])
  } catch {
    return []
  }
}

export default async function BrandsPage() {
  const brands = await fetchBrands()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-28 md:pb-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Брэндүүд</span>
      </nav>

      <h1 className="text-2xl font-black text-gray-800 mb-8">Брэндүүд</h1>

      {brands.length === 0 ? (
        <p className="text-gray-400 text-sm">Брэнд олдсонгүй.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all p-5 flex flex-col items-center justify-center gap-3 group min-h-[100px]"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-xl font-black text-primary group-hover:scale-110 transition-transform">
                {brand.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-gray-700 text-center group-hover:text-primary transition-colors leading-tight">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
