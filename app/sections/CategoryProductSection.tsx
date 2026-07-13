'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useTenant } from '../lib/TenantContext'
import { useTenantHref } from '../lib/useTenantHref'
import { resolveUploadUrl } from '../lib/apiClient'
import { formatPrice } from '../lib/mockCatalog'
import { addToCart, readCart, updateQuantity, removeFromCart } from '../lib/cartStore'
import ImagePlaceholder from '../components/ImagePlaceholder'
import Reveal from '../components/Reveal'

// Curated, high-quality banner photos used for the promo big-slides.
const PROMO_IMAGES = [
  'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1600&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=500&fit=crop&q=80',
]

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

// ── Horizontal scroll row for one category ────────────────────────────────────
function CategoryRow({
  cat,
  items,
  primaryColor,
  tenantName,
  tenantHref,
  cartMap,
  addingId,
  onAddToCart,
  onIncrease,
  onDecrease,
  onQuickView,
}: {
  cat: Category
  items: Product[]
  primaryColor: string
  tenantName: string
  tenantHref: (href: string) => string
  cartMap: Record<string, number>
  addingId: string | null
  onAddToCart: (e: React.MouseEvent, p: Product, brand: string) => void
  onIncrease: (e: React.MouseEvent, id: string) => void
  onDecrease: (e: React.MouseEvent, id: string) => void
  onQuickView: (p: Product) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [items])

  function scrollBy(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  // Auto-slide every 2s with a smooth eased glide (loops; pauses on hover/touch).
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let paused = false
    let raf = 0
    const pause = () => { paused = true }
    const resume = () => { paused = false }
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    el.addEventListener('touchstart', pause, { passive: true })

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const glide = (node: HTMLElement, target: number, duration = 750) => {
      cancelAnimationFrame(raf)
      const start = node.scrollLeft
      const dist = target - start
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1)
        node.scrollLeft = start + dist * easeInOutCubic(p)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    const id = setInterval(() => {
      if (paused) return
      const node = scrollRef.current
      if (!node) return
      const firstCard = node.querySelector('[data-card]') as HTMLElement | null
      const step = firstCard ? firstCard.offsetWidth + 12 : node.clientWidth * 0.8
      if (node.scrollLeft + node.clientWidth >= node.scrollWidth - 4) {
        glide(node, 0, 900)
      } else {
        glide(node, node.scrollLeft + step)
      }
    }, 2000)

    return () => {
      clearInterval(id)
      cancelAnimationFrame(raf)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('touchstart', pause)
    }
  }, [items])

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 sm:h-7 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
          <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">{cat.name}</h2>
        </div>
        <Link
          href={tenantHref(`/${cat.slug}`)}
          className="text-xs sm:text-sm font-bold flex items-center gap-1 hover:gap-2 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-all shrink-0"
          style={{ color: primaryColor }}
        >
          Бүгдийг харах
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Scrollable row */}
      <div className="relative group/row">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollBy('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:shadow-xl transition-all"
            aria-label="Зүүн"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollBy('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:shadow-xl transition-all"
            aria-label="Баруун"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        >
          {items.map((p) => {
            const img = resolveUploadUrl(p.images?.[0])
            const brand = (p.brandId && p.brandId !== 'br1') ? p.brandId : tenantName
            const isOnSale = !!p.salePrice
            const displayPrice = p.salePrice ?? p.price

            return (
              <Link
                key={p.id}
                data-card
                href={tenantHref(`/product/${p.slug || p.id}`)}
                className="group w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                  {img ? (
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      className={`object-cover group-hover:scale-105 transition-transform duration-300 ${p.stock === 0 ? 'grayscale opacity-60' : ''}`}
                      sizes="176px"
                    />
                  ) : (
                    <ImagePlaceholder />
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
                  {/* Hover quick-view */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(p) }}
                      className="flex items-center gap-1.5 bg-white/95 text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow hover:bg-white active:scale-95 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Хялбар үзэлт
                    </button>
                  </div>
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
                  {typeof p.stock === 'number' && p.stock > 0 && (
                    <div className={`text-[9px] font-bold mt-1 ${p.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      Үлдэгдэл: {p.stock.toLocaleString('mn-MN')}ш
                    </div>
                  )}
                  {cartMap[p.id] ? (
                    <div
                      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                      className="mt-2 flex items-center justify-between rounded-xl overflow-hidden border-2 text-sm font-black"
                      style={{ borderColor: primaryColor }}
                    >
                      <button
                        onClick={(e) => onDecrease(e, p.id)}
                        className="px-3 py-1.5 transition-colors hover:bg-gray-50 text-gray-700 text-base leading-none"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center text-xs font-black" style={{ color: primaryColor }}>
                        {cartMap[p.id]}
                      </span>
                      <button
                        onClick={(e) => onIncrease(e, p.id)}
                        className="px-3 py-1.5 text-white transition-colors text-base leading-none"
                        style={{ backgroundColor: primaryColor }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => onAddToCart(e, p, brand)}
                      disabled={p.stock === 0}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: p.stock === 0 ? '#9ca3af' : primaryColor }}
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
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CategoryProductSection({ categoryId }: { categoryId?: string }) {
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
  const [addingId, setAddingId] = useState<string | null>(null)
  const [cartMap, setCartMap] = useState<Record<string, number>>({})

  // Quick-view modal
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [quickImg, setQuickImg] = useState(0)
  const quickImages = quickView ? (quickView.images || []).map((im) => resolveUploadUrl(im)).filter(Boolean) as string[] : []

  useEffect(() => {
    if (!quickView) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [quickView])

  function syncCart() {
    const items = readCart()
    const map: Record<string, number> = {}
    items.forEach(i => { map[i.id] = i.quantity })
    setCartMap(map)
  }

  useEffect(() => {
    syncCart()
    window.addEventListener('cart:changed', syncCart)
    return () => window.removeEventListener('cart:changed', syncCart)
  }, [])

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

  function handleIncrease(e: React.MouseEvent, id: string) {
    e.preventDefault(); e.stopPropagation()
    updateQuantity(id, (cartMap[id] ?? 0) + 1)
  }

  function handleDecrease(e: React.MouseEvent, id: string) {
    e.preventDefault(); e.stopPropagation()
    const next = (cartMap[id] ?? 1) - 1
    if (next <= 0) removeFromCart(id)
    else updateQuantity(id, next)
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/categories/public?tenantId=${tenantId}`).then((r) => r.json()),
      fetch(`/api/products/public?tenantId=${tenantId}`).then((r) => r.json()),
    ])
      .then(([catBody, prodBody]) => {
        if (catBody?.data) {
          const allCats = catBody.data.filter((c: Category) => c.status === 'active' && !c.parentId)
          if (categoryId) {
            setCategories(allCats.filter((c: Category) => c.id === categoryId))
          } else {
            setCategories(allCats)
          }
        }
        if (prodBody?.data) setProducts(prodBody.data.filter((p: Product) => p.status === 'active' || !p.status))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tenantId, categoryId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-6 sm:mt-10 space-y-8 sm:space-y-12">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded-full w-32" />
              <div className="h-4 bg-gray-100 rounded-full w-20" />
            </div>
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="rounded-2xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 w-40 sm:w-44">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-2.5 space-y-2">
                    <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-7 bg-gray-100 rounded-xl mt-2" />
                  </div>
                </div>
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
      {categoriesWithProducts.map(({ cat, items }, idx) => (
        <Fragment key={cat.id}>
          <Reveal>
            <CategoryRow
              cat={cat}
              items={items}
              primaryColor={primaryColor}
              tenantName={tenantName}
              tenantHref={tenantHref}
              cartMap={cartMap}
              addingId={addingId}
              onAddToCart={handleAddToCart}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              onQuickView={(p) => { setQuickView(p); setQuickImg(0) }}
            />
          </Reveal>
          {/* Promo big-slide after every 2 rows */}
          {(idx + 1) % 2 === 0 && idx < categoriesWithProducts.length - 1 && (
            <Reveal>
            <Link
              href={tenantHref(`/${categoriesWithProducts[(idx + 1) % categoriesWithProducts.length]?.cat.slug ?? ''}`)}
              className="group block relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg h-40 sm:h-56"
            >
              <Image
                src={PROMO_IMAGES[Math.floor(idx / 2) % PROMO_IMAGES.length]}
                alt=""
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="100vw"
              />
              {/* Primary-tinted gradient for legibility + brand feel */}
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(105deg, ${primaryColor}f2 0%, ${primaryColor}b3 42%, rgba(0,0,0,0.25) 100%)` }}
              />
              <div className="relative z-10 h-full flex flex-col justify-center p-6 sm:p-10 text-white max-w-lg">
                <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[3px] opacity-80 mb-1.5">Онцгой санал</p>
                <h3 className="text-lg sm:text-3xl font-black leading-tight mb-3 drop-shadow">Шинэ бараа, хямдралтай бүтээгдэхүүн</h3>
                <span className="inline-flex w-max items-center gap-1.5 bg-white text-gray-900 text-xs sm:text-sm font-black px-5 py-2.5 rounded-full group-hover:gap-2.5 transition-all shadow">
                  Дэлгүүр хэсэх
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </Link>
            </Reveal>
          )}
        </Fragment>
      ))}

      {/* Quick-view ("Хялбар үзэлт") modal */}
      {quickView && (() => {
        const qv = quickView
        const brand = (qv.brandId && qv.brandId !== 'br1') ? qv.brandId : tenantName
        const displayPrice = qv.salePrice ?? qv.price
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setQuickView(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden grid sm:grid-cols-2 max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setQuickView(null)}
                aria-label="Хаах"
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-gray-500 hover:text-gray-800 shadow flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              {/* Gallery */}
              <div className="bg-gray-50 p-4 flex flex-col">
                <div className="relative flex-1 min-h-[240px] rounded-xl overflow-hidden bg-white flex items-center justify-center">
                  {quickImages[quickImg] ? (
                    <Image src={quickImages[quickImg]} alt={qv.name} fill className="object-contain p-4" sizes="(max-width:640px) 100vw, 384px" unoptimized />
                  ) : (
                    <ImagePlaceholder />
                  )}
                </div>
                {quickImages.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {quickImages.map((img, i) => (
                      <button key={i} type="button" onClick={() => setQuickImg(i)}
                        className={`relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === quickImg ? 'border-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                        <Image src={img} alt={`${qv.name} ${i + 1}`} fill className="object-cover" sizes="56px" unoptimized />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 sm:p-6 flex flex-col overflow-y-auto">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{brand}</div>
                <h3 className="text-base font-bold text-gray-900 leading-snug mb-3">{qv.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-black" style={{ color: primaryColor }}>{formatPrice(displayPrice)}</span>
                  {qv.salePrice && <span className="text-sm font-medium text-gray-400 line-through">{formatPrice(qv.price)}</span>}
                </div>
                {qv.stock === 0 ? (
                  <p className="text-sm font-semibold text-gray-400 mb-4">Дууссан</p>
                ) : (
                  <p className="text-xs text-emerald-600 mb-4 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {typeof qv.stock === 'number' ? `Үлдэгдэл: ${qv.stock.toLocaleString('mn-MN')}ш` : 'Бэлэн байгаа'}
                  </p>
                )}
                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    disabled={qv.stock === 0}
                    onClick={() => {
                      addToCart({ id: qv.id, slug: qv.slug || qv.id, name: qv.name, price: displayPrice, icon: '📦', brand })
                      if (toastTimer.current) clearTimeout(toastTimer.current)
                      setToast({ name: qv.name })
                      toastTimer.current = setTimeout(() => setToast(null), 2500)
                    }}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    style={{ backgroundColor: qv.stock === 0 ? undefined : primaryColor }}
                  >
                    Сагсанд нэмэх
                  </button>
                  <Link href={tenantHref(`/product/${qv.slug || qv.id}`)} onClick={() => setQuickView(null)}
                    className="w-full py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-colors text-center">
                    Дэлгэрэнгүй харах
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 z-[200] w-[min(90vw,340px)] pointer-events-none">
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
