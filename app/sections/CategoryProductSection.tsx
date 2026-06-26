'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useTenant } from '../lib/TenantContext'
import { useTenantHref } from '../lib/useTenantHref'
import { resolveUploadUrl } from '../lib/apiClient'
import { formatPrice } from '../lib/mockCatalog'
import { addToCart } from '../lib/cartStore'

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

  // toast
  const [toast, setToast] = useState<{ name: string } | null>(null)
  const toastTimer = useRef<NodeJS.Timeout | null>(null)
  // per-product add animation: productId -> count shown
  const [addingId, setAddingId] = useState<string | null>(null)

  function handleAddToCart(e: React.MouseEvent, p: Product, brand: string) {
    e.preventDefault()
    e.stopPropagation()
    addToCart({ id: p.id, slug: p.slug || p.id, name: p.name, price: p.salePrice ?? p.price, icon: '📦', brand })
    setAddingId(p.id)
    setTimeout(() => setAddingId(null), 600)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ name: p.name })
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-6 sm:mt-10 space-y-8 sm:space-y-12">
      {categoriesWithProducts.map(({ cat, items }) => (
        <section key={cat.id}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-gray-900">{cat.name}</h2>
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
                    <p className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight mt-0.5 line-clamp-2 flex-1">{p.name}</p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-xs sm:text-sm font-black" style={{ color: primaryColor }}>
                        {formatPrice(displayPrice)}
                      </span>
                      {isOnSale && (
                        <span className="text-[10px] text-gray-400 line-through">{formatPrice(p.price)}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, p, brand)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-white transition-all active:scale-95"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span
                        key={addingId === p.id ? 'anim' : 'idle'}
                        className={addingId === p.id ? 'animate-bounce' : ''}
                      >
                        {addingId === p.id ? '+1' : 'Сагслах'}
                      </span>
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      {/* Mobile-safe toast — fixed bottom, avoids bottom nav */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] w-[min(90vw,340px)] pointer-events-none">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-[slideUp_0.25s_ease-out]">
            <span className="shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            <p className="text-sm font-semibold leading-snug truncate flex-1">{toast.name} сагсанд нэмэгдлээ!</p>
            <span className="text-green-400 shrink-0">✓</span>
          </div>
        </div>
      )}
    </div>
  )
}
