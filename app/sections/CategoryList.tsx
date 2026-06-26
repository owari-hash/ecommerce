'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTenant } from '../lib/TenantContext'
import { useTenantHref } from '../lib/useTenantHref'
import { CATEGORY_ICONS } from '../lib/mockCatalog'
import { resolveUploadUrl } from '../lib/apiClient'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  image?: string
  status: string
}


function getCategoryEmoji(slug: string, name?: string): string {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (s.includes('buidan') || n.includes('буйдан')) return '🛋️';
  if (s.includes('ajlyn-oroonii') || s.includes('ajliin-oroonii') || n.includes('ажлын өрөө')) return '💼';
  if (s.includes('ariun-cevriin') || s.includes('ariun-tsevriin') || n.includes('ариун цэвэр')) return '🛁';
  if (s.includes('gal-togoo') || n.includes('гал тогоо') || n.includes('хоолны')) return '🍳';
  if (s.includes('ger-ahuin-cimeglel') || s.includes('ger-ahuin-chimeglel') || n.includes('чимэглэл') || n.includes('гэр ахуй')) return '🪴';
  if (s.includes('gerel') || n.includes('гэрэл')) return '💡';
  if (s.includes('zocny') || s.includes('zochnii') || n.includes('зочны')) return '📺';
  if (s.includes('tagt') || s.includes('gadna') || n.includes('тагт') || n.includes('гадна')) return '🏡';
  if (s.includes('untlagyn') || s.includes('untlagiin') || n.includes('унтлагын')) return '🛏️';
  if (s.includes('huuhdiin') || n.includes('хүүхдийн')) return '🧸';
  if (s.includes('uudnii') || n.includes('үүдний')) return '🚪';
  if (s.includes('cahilgaan') || s.includes('electron') || n.includes('цахилгаан')) return '💻';
  if (s.includes('brand') || n.includes('брэнд')) return '🏷️';

  // Fallbacks to standard English slugs if any
  if (s.includes('laptop')) return '💻';
  if (s.includes('computer')) return '🖥️';
  if (s.includes('phone') || s.includes('tablet')) return '📱';
  if (s.includes('console') || s.includes('game')) return '🎮';
  if (s.includes('audio') || s.includes('headphone')) return '🎧';
  if (s.includes('grocery') || s.includes('shop')) return '🛒';
  if (s.includes('fruit')) return '🍎';
  if (s.includes('meat')) return '🥩';
  if (s.includes('dairy') || s.includes('egg') || s.includes('milk')) return '🥛';
  if (s.includes('seafood') || s.includes('fish')) return '🐟';
  if (s.includes('vegetable') || s.includes('broccoli')) return '🥦';
  if (s.includes('bakery') || s.includes('bread')) return '🥐';
  if (s.includes('beverage') || s.includes('drink')) return '🥤';
  if (s.includes('snack') || s.includes('sweet')) return '🥨';
  if (s.includes('home')) return '🏠';
  if (s.includes('accessory')) return '🖱️';

  return 'SVG_FALLBACK';
}

function resolveImageUrl(url: string | undefined, defaultEmoji: string = 'SVG_FALLBACK') {
  if (!url) return { imageUrl: null, emoji: defaultEmoji }
  let cleaned = url.trim().replace(/^(Оруулах|оруулах|[Oo]ruulah|[Uu]pload)/g, '').trim();
  if (!cleaned) return { imageUrl: null, emoji: defaultEmoji }
  if (cleaned.length <= 4 && !cleaned.includes('/') && !cleaned.includes('.')) {
    return { imageUrl: null, emoji: cleaned };
  }
  return { imageUrl: resolveUploadUrl(cleaned) || null, emoji: null }
}

export default function CategoryList({ showBrands = true }: { showBrands?: boolean }) {
  const { tenantId } = useTenant()
  const tenantHref = useTenantHref()
  const [categories, setCategories] = useState<Category[]>([])
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
  }, [tenantId])

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-12 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200" />
              <div className="h-3 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  const items = [
    ...categories.map((c) => {
      const resolved = resolveImageUrl(c.image, 'SVG_FALLBACK')
      return {
        key: c.id,
        href: tenantHref(`/${c.slug}`),
        imageUrl: resolved.imageUrl,
        emoji: resolved.emoji,
        label: c.name,
      }
    }),
    ...(showBrands ? [{ key: 'brands', href: tenantHref('/brands'), imageUrl: null, emoji: '🏷️', label: 'Брэндүүд' }] : []),
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Ангилал</h2>
        <Link href={tenantHref('/categories')} className="text-sm font-bold text-primary hover:underline">
          Бүгдийг харах 
        </Link>
      </div>
      <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 gap-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 sm:gap-4">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="group flex flex-col items-center text-center shrink-0 w-[72px] sm:w-auto gap-2"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-gray-200 group-hover:border-primary overflow-hidden group-hover:scale-110 transition-all duration-200 flex items-center justify-center bg-gray-50/50">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.label}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : item.emoji && item.emoji !== 'SVG_FALLBACK' && item.emoji !== '📁' ? (
                <span className="text-2xl sm:text-3xl">{item.emoji}</span>
              ) : (
                <svg className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-600 group-hover:text-primary transition-colors leading-tight">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
