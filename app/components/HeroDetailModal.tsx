'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowUpRight, Package } from 'lucide-react'
import { formatPrice } from '../lib/mockCatalog'
import { resolveUploadUrl } from '../lib/apiClient'
import { useTenantHref } from '../lib/useTenantHref'

interface Slide {
  href: string
  title: string
  subtitle: string
  emoji: string
  image: string
  images?: string[]
}

interface Product {
  id: string
  slug: string
  name: string
  price: number
  salePrice: number | null
  images: string[]
  stock: number
}

interface HeroDetailModalProps {
  slide: Slide
  tenantId?: string
  onClose: () => void
}

export default function HeroDetailModal({ slide, tenantId, onClose }: HeroDetailModalProps) {
  const tenantHref = useTenantHref()
  const images = slide.images && slide.images.length > 0 ? slide.images.slice(0, 5) : [slide.image]
  const [products, setProducts] = useState<Product[]>([])
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!tenantId) return
    const slug = slide.href.replace(/^\/+/, '').split('/')[0]
    Promise.all([
      fetch(`/api/categories/public?tenantId=${tenantId}`).then((r) => r.json()),
      fetch(`/api/products/public?tenantId=${tenantId}`).then((r) => r.json()),
    ])
      .then(([catBody, prodBody]) => {
        const categories = catBody?.data ?? []
        const allProducts = prodBody?.data ?? []
        const cat = slug ? categories.find((c: any) => c.slug === slug) : null
        const filtered = cat
          ? allProducts.filter((p: any) => p.categoryId === cat.id)
          : allProducts
        setProducts(filtered.slice(0, 8))
        setCategoryName(cat?.name ?? '')
      })
      .catch(console.error)
  }, [tenantId, slide.href])

  return (
    <div className="fixed inset-0 z-[200] bg-gray-950">
      <button
        type="button"
        onClick={onClose}
        aria-label="Хаах"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[210] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5" strokeWidth={2} />
      </button>

      <div className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
        {images.map((src, i) => (
          <section key={src + i} className="relative w-full h-dvh snap-start shrink-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 1.08 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ amount: 0.6, once: false }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <Image
                src={src}
                alt={slide.subtitle}
                fill
                priority={i === 0}
                quality={92}
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {i === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.6, once: false }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                className="absolute inset-x-0 top-[14%] sm:top-[18%] flex flex-col items-center px-4 text-center pointer-events-none"
              >
                {slide.title && (
                  <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[3px] text-white/70 mb-3">{slide.title}</p>
                )}
                <h1
                  className="text-white uppercase font-black leading-[0.9] tracking-tight text-balance"
                  style={{ fontSize: 'clamp(2.25rem, 8vw, 5.5rem)' }}
                >
                  {slide.subtitle}
                </h1>
              </motion.div>
            )}

            <div className="absolute bottom-6 sm:bottom-10 inset-x-0 flex items-center justify-center text-white/70">
              <span className="text-[11px] font-semibold tabular-nums tracking-wide">
                {String(i + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </span>
            </div>
          </section>
        ))}

        {/* After the images: that category's product list */}
        <section className="min-h-dvh bg-white snap-start px-4 sm:px-8 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[3px] text-primary mb-2">
                  {categoryName || 'Санал болгох'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Холбоотой бүтээгдэхүүн
                </h2>
              </div>
              <Link
                href={tenantHref(slide.href)}
                onClick={onClose}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline shrink-0"
              >
                Бүгдийг үзэх
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.4} />
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {products.map((p) => {
                  const displayPrice = p.salePrice ?? p.price
                  const img = resolveUploadUrl(p.images?.[0])
                  return (
                    <Link
                      key={p.id}
                      href={tenantHref(`/product/${p.slug || p.id}`)}
                      onClick={onClose}
                      className="group block rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                        {img ? (
                          <Image src={img} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 50vw, 25vw" unoptimized />
                        ) : (
                          <Package className="w-10 h-10 text-gray-300" strokeWidth={1.4} />
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs font-bold text-gray-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">{p.name}</h3>
                        <span className="text-sm font-black text-gray-900">{formatPrice(displayPrice)}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Бүтээгдэхүүн ачаалж байна…</p>
            )}

            <div className="mt-8 sm:hidden">
              <Link
                href={tenantHref(slide.href)}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                Бүгдийг үзэх
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
