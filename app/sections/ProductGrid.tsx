'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTenant } from '../lib/TenantContext'
import Carousel from '../components/Carousel'
import ProductCard from '../components/ProductCard'
import { resolveUploadUrl } from '../lib/apiClient'

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
  const { tenantId, branding } = useTenant()
  const tenantName = branding?.name ?? ''
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/public?tenantId=${tenantId}`)
      .then((res) => res.json())
      .then((body) => {
        if (body && body.data) {
          const mapped = body.data.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            brand: (p.brandId && p.brandId !== 'br1') ? p.brandId : tenantName,
            category: p.categoryId,
            price: p.salePrice ? p.salePrice : p.price,
            oldPrice: p.salePrice ? p.price : undefined,
            isNew: p.featured || false,
            isSale: p.salePrice ? true : false,
            image: resolveUploadUrl(p.images?.[0]) || '',
            stock: p.stock,
          }))
          setProducts(mapped)
        }
      })
      .catch((err) => console.error('Failed to fetch products', err))
      .finally(() => setLoading(false))
  }, [tenantId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-10 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-gray-200 rounded-2xl h-44" />
          ))}
        </div>
      </div>
    )
  }

  let filtered = products

  if (isNew) filtered = filtered.filter((p) => p.isNew)
  if (isSale) filtered = filtered.filter((p) => p.isSale)
  if (category) filtered = filtered.filter((p) => p.category === category || p.slug === category)

  // If a specific filter yields nothing, skip this grid entirely only when
  // there's also a no-filter grid that will show all products.
  // For the no-filter (all-products) grid, always show if there are any products.
  if (filtered.length === 0 && (isNew || isSale || category)) {
    return null
  }

  const sliced = filtered.slice(0, limit)
  const pages = chunk(sliced, 6)

  if (sliced.length === 0) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 mt-10">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 min-w-0 truncate">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="shrink-0 text-sm font-bold text-primary hover:underline">
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
