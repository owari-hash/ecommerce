import Link from 'next/link'
import { MOCK_PRODUCTS } from '../lib/mockCatalog'

interface BrandListProps {
  title?: string
  limit?: number
}

export default function BrandList({ title = 'Брэндүүд', limit = 12 }: BrandListProps) {
  // Derive unique brands from mock products
  const brands = Array.from(
    new Map(MOCK_PRODUCTS.filter((p) => p.brand).map((p) => [p.brand, p.brand])).values()
  ).slice(0, limit)

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-gray-900">{title}</h2>
        <Link href="/brands" className="text-sm font-bold text-primary hover:underline">
          Бүгдийг харах →
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {brands.map((brand) => (
          <Link
            key={brand}
            href={`/brands/${brand?.toLowerCase().replace(/\s+/g, '-')}`}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-primary text-sm font-bold text-gray-700 hover:text-primary transition-all"
          >
            {brand}
          </Link>
        ))}
      </div>
    </section>
  )
}
