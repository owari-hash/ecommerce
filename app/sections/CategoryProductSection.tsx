'use client'
// v2
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTenant } from '../lib/TenantContext'
import { useTenantHref } from '../lib/useTenantHref'
import { resolveUploadUrl } from '../lib/apiClient'
import { formatPrice } from '../lib/mockCatalog'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  image?: string
  status: string
}

interface Product {
  id: string
  name: string
  slug: string
  brandId: string
  price: number
  salePrice: number | null
  stock: number
  images: string[]
  categoryId: string
  featured: boolean
  status: string
}

export default function CategoryProductSection() {
  const { tenantId, branding } = useTenant()
  const tenantHref = useTenantHref()
  const tenantName = branding?.name ?? ''
  const primaryColor = branding?.primaryColor ?? '#D32F2F'

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/categories/public?tenantId=${tenantId}`).then((r) => r.json()),
      fetch(`/api/products/public?tenantId=${tenantId}`).then((r) => r.json()),
    ])
      .then(([catBody, prodBody]) => {
        if (catBody?.data) setCategories(catBody.data.filter((c: Category) => c.status === 'active' && !c.parentId))
        if (prodBody?.data) setProducts(prodBody.data.filter((p: Product) => p.status === 'active' || !p.status))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tenantId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-10 space-y-10 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="flex gap-3 overflow-x-auto">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="w-36 h-48 bg-gray-200 rounded-2xl shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const categoriesWithProducts = categories
    .map((cat) => ({
      cat,
      items: products.filter((p) => p.categoryId === cat.id && (p.stock ?? 1) > 0).slice(0, 10),
    }))
    .filter(({ items }) => items.length > 0)

  if (categoriesWithProducts.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto px-4 mt-10 space-y-12">
      {categoriesWithProducts.map(({ cat, items }) => (
        <section key={cat.id}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900">{cat.name}</h2>
            <Link
              href={tenantHref(`/${cat.slug}`)}
              className="text-sm font-bold hover:underline"
              style={{ color: primaryColor }}
            >
              Бүгдийг харах →
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {items.map((p) => {
              const img = resolveUploadUrl(p.images?.[0])
              const brand = (p.brandId && p.brandId !== 'br1') ? p.brandId : tenantName
              const isOnSale = !!p.salePrice
              const displayPrice = p.salePrice ?? p.price

              return (
                <Link
                  key={p.id}
                  href={tenantHref(`/product/${p.slug || p.id}`)}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                    {img ? (
                      <Image
                        src={img}
                        alt={p.name}
                        fill
                        className={`object-cover group-hover:scale-105 transition-transform duration-300 ${p.stock === 0 ? 'grayscale opacity-60' : ''}`}
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                    {isOnSale && (
                      <span className="absolute top-2 left-2 text-[10px] font-black text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: primaryColor }}>
                        SALE
                      </span>
                    )}
                    {p.stock === 0 && (
                      <span className="absolute top-2 right-2 text-[10px] font-black bg-gray-700 text-white px-1.5 py-0.5 rounded-full">
                        Дууссан
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 flex flex-col flex-1">
                    <p className="text-[10px] text-gray-400 font-medium truncate">{brand}</p>
                    <p className="text-xs font-bold text-gray-800 leading-tight mt-0.5 line-clamp-2 flex-1">{p.name}</p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-sm font-black" style={{ color: primaryColor }}>
                        {formatPrice(displayPrice)}
                      </span>
                      {isOnSale && (
                        <span className="text-[10px] text-gray-400 line-through">{formatPrice(p.price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
