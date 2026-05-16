import Link from 'next/link'
import { MOCK_PRODUCTS } from '../lib/mockCatalog'
import Carousel from '../components/Carousel'
import ProductCard from '../components/ProductCard'

interface ProductGridProps {
  title?: string
  limit?: number
  isNew?: boolean
  isSale?: boolean
  category?: string
  viewAllHref?: string
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export default function ProductGrid({
  title = 'Бараа',
  limit = 12,
  isNew,
  isSale,
  category,
  viewAllHref,
}: ProductGridProps) {
  let products = MOCK_PRODUCTS

  if (isNew) products = products.filter((p) => p.isNew)
  if (isSale) products = products.filter((p) => p.isSale)
  if (category) products = products.filter((p) => p.category === category)

  const sliced = products.slice(0, limit)
  const pages = chunk(sliced, 6)

  return (
    <div className="max-w-7xl mx-auto px-4 mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-gray-900">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-bold text-primary hover:underline">
            Бүгдийг харах
          </Link>
        )}
      </div>
      <Carousel
        ariaLabel={title}
        autoplayMs={6000}
        slides={pages.map((page, pageIdx) => (
          <div key={pageIdx} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
            {page.map((p, i) => (
              <ProductCard key={`${p.id}_${pageIdx}_${i}`} {...p} />
            ))}
          </div>
        ))}
      />
    </div>
  )
}
