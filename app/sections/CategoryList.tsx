'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Laptop, Monitor, Smartphone, Gamepad2, Headphones, Mouse, Cpu,
  Apple, Carrot, Beef, Milk, Fish, Croissant, CupSoda, Cookie, UtensilsCrossed,
  Sofa, CookingPot, Lightbulb, Baby, DoorOpen, Bath, Briefcase, Sprout, Tv,
  Tag, ShoppingBag, type LucideIcon,
} from 'lucide-react'
import { useTenant } from '../lib/TenantContext'
import { useTenantHref } from '../lib/useTenantHref'
import { resolveUploadUrl } from '../lib/apiClient'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  image?: string
  status: string
}

/** Pick a proper line icon for a category from its slug/name. */
function getCategoryIcon(slug: string, name?: string): LucideIcon {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (s.includes('buidan') || n.includes('буйдан')) return Sofa;
  if (s.includes('ajlyn-oroonii') || s.includes('ajliin-oroonii') || n.includes('ажлын өрөө')) return Briefcase;
  if (s.includes('ariun-cevriin') || s.includes('ariun-tsevriin') || n.includes('ариун цэвэр')) return Bath;
  if (s.includes('gal-togoo') || n.includes('гал тогоо') || n.includes('хоолны')) return CookingPot;
  if (s.includes('ger-ahuin') || n.includes('чимэглэл') || n.includes('гэр ахуй')) return Sprout;
  if (s.includes('gerel') || n.includes('гэрэл')) return Lightbulb;
  if (s.includes('zocny') || s.includes('zochnii') || n.includes('зочны')) return Tv;
  if (s.includes('untlagyn') || s.includes('untlagiin') || n.includes('унтлагын')) return Sofa;
  if (s.includes('huuhdiin') || n.includes('хүүхдийн')) return Baby;
  if (s.includes('uudnii') || n.includes('үүдний')) return DoorOpen;
  if (n.includes('зөөврийн') || s.includes('laptop')) return Laptop;
  if (n.includes('суурин') || s.includes('computer') || s.includes('desktop')) return Monitor;
  if (n.includes('ухаалаг') || s.includes('phone') || s.includes('tablet') || s.includes('smart')) return Smartphone;
  if (n.includes('консоль') || s.includes('console') || s.includes('game')) return Gamepad2;
  if (n.includes('аудио') || s.includes('audio') || s.includes('headphone')) return Headphones;
  if (n.includes('дагалдах') || s.includes('accessor')) return Mouse;
  if (n.includes('цахилгаан') || s.includes('electron')) return Cpu;
  if (n.includes('бусад') || s.includes('other')) return Cpu;
  if (s.includes('brand') || n.includes('брэнд')) return Tag;

  // Grocery / food
  if (n.includes('жимс') || s.includes('fruit')) return Apple;
  if (n.includes('ногоо') || s.includes('vegetable')) return Carrot;
  if (n.includes('мах') || s.includes('meat')) return Beef;
  if (n.includes('сүү') || s.includes('dairy') || s.includes('milk') || s.includes('egg')) return Milk;
  if (n.includes('далайн') || s.includes('seafood') || s.includes('fish')) return Fish;
  if (n.includes('талх') || n.includes('боов') || s.includes('bakery') || s.includes('bread')) return Croissant;
  if (n.includes('ундаа') || n.includes('ус') || s.includes('beverage') || s.includes('drink')) return CupSoda;
  if (n.includes('зууш') || n.includes('амттан') || s.includes('snack') || s.includes('sweet')) return Cookie;
  if (n.includes('хүнс') || s.includes('grocery') || s.includes('food')) return UtensilsCrossed;

  return ShoppingBag;
}

function resolveImageUrl(url: string | undefined): string | null {
  if (!url) return null
  const cleaned = url.trim().replace(/^(Оруулах|оруулах|[Oo]ruulah|[Uu]pload)/g, '').trim();
  if (!cleaned) return null
  // Short text (custom emoji) — not a real image
  if (cleaned.length <= 4 && !cleaned.includes('/') && !cleaned.includes('.')) return null
  return resolveUploadUrl(cleaned) || null
}

export default function CategoryList({ showBrands = true }: { showBrands?: boolean }) {
  const { tenantId } = useTenant()
  const tenantHref = useTenantHref()
  const [categories, setCategories] = useState<Category[]>([])
  const [catImageById, setCatImageById] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/categories/public?tenantId=${tenantId}`)
      .then((res) => res.json())
      .then((body) => {
        if (body?.data) {
          setCategories(body.data.filter((c: Category) => c.status === 'active' && !c.parentId))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))

    // Representative product image per category (fallback for categories without their own image)
    fetch(`/api/products/public?tenantId=${tenantId}`)
      .then((res) => res.json())
      .then((body) => {
        const map: Record<string, string> = {}
        for (const p of (body?.data ?? [])) {
          const img = p.images?.[0]
          if (p.categoryId && img && !map[p.categoryId]) map[p.categoryId] = img
        }
        setCatImageById(map)
      })
      .catch(() => {})
  }, [tenantId])

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-12 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[150px] sm:h-[170px] rounded-2xl bg-gray-200" />
          ))}
        </div>
      </section>
    )
  }

  const items = [
    ...categories.map((c) => {
      let imageUrl = resolveImageUrl(c.image)
      if (!imageUrl && catImageById[c.id]) imageUrl = resolveImageUrl(catImageById[c.id])
      return {
        key: c.id,
        href: tenantHref(`/${c.slug}`),
        imageUrl,
        Icon: getCategoryIcon(c.slug, c.name),
        label: c.name,
      }
    }),
    ...(showBrands ? [{ key: 'brands', href: tenantHref('/brands'), imageUrl: null, Icon: Tag, label: 'Брэндүүд' }] : []),
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Ангилал</h2>
        <Link href={tenantHref('/categories')} className="text-sm font-bold text-primary hover:underline">
          Бүгдийг харах →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[150px] sm:auto-rows-[170px]">
        {items.map((item, idx) => {
          const wide = idx === 0
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#15171c] to-[#23262e] border border-white/5 hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 ${wide ? 'col-span-2' : ''}`}
            >
              <div className="pointer-events-none absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                <h3 className="text-white font-bold uppercase text-xs sm:text-sm tracking-wide leading-tight max-w-[62%]">
                  {item.label}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                  Дэлгүүрлэх
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>

              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.label}
                  width={160}
                  height={160}
                  unoptimized
                  className="absolute right-1 bottom-1 w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <item.Icon
                  strokeWidth={1.4}
                  className="absolute right-4 bottom-4 w-14 h-14 sm:w-16 sm:h-16 text-white/85 group-hover:text-primary group-hover:scale-110 transition-all duration-300"
                />
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
