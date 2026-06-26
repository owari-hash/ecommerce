import Link from 'next/link'

interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
}

interface BrandListProps {
  title?: string
  limit?: number
}

async function fetchBrands(): Promise<Brand[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    const res = await fetch(`${apiUrl}/api/brands?status=active&limit=100`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.brands ?? data.data ?? [])
  } catch {
    return []
  }
}

export default async function BrandList({ title = 'Брэндүүд', limit = 12 }: BrandListProps) {
  const all = await fetchBrands()
  const brands = all.slice(0, limit)

  if (brands.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-gray-900">{title}</h2>
        <Link href="/brands" className="text-sm font-bold text-primary hover:underline">
          Бүгдийг харах
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-primary text-sm font-bold text-gray-700 hover:text-primary transition-all"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
