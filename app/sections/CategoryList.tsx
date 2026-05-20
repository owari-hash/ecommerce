'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTenant } from '../lib/TenantContext'
import { useTenantHref } from '../lib/useTenantHref'
import { CATEGORY_ICONS } from '../lib/mockCatalog'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  image?: string
  status: string
}

function isUrl(s: string) {
  return s.startsWith('http://') || s.startsWith('https://')
}

export default function CategoryList({ showBrands = true }: { showBrands?: boolean }) {
  const { tenantId } = useTenant()
  const tenantHref = useTenantHref()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    fetch(`${apiUrl}/api/categories/public?tenantId=${tenantId}`)
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
    ...categories.map((c) => ({
      key: c.id,
      href: tenantHref(`/${c.slug}`),
      imageUrl: c.image && isUrl(c.image) ? c.image : null,
      emoji: (!c.image || !isUrl(c.image))
        ? (c.image || CATEGORY_ICONS[c.slug as keyof typeof CATEGORY_ICONS] || '📁')
        : null,
      label: c.name,
    })),
    ...(showBrands ? [{ key: 'brands', href: tenantHref('/brands'), imageUrl: null, emoji: '🏷️', label: 'Брэндүүд' }] : []),
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Ангилал</h2>
        <Link href={tenantHref('/categories')} className="text-sm font-bold text-primary hover:underline">
          Бүгдийг харах →
        </Link>
      </div>
      <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 gap-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 sm:gap-4">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="group flex flex-col items-center text-center shrink-0 w-[72px] sm:w-auto gap-2"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-gray-200 group-hover:border-primary overflow-hidden group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.label}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="text-2xl sm:text-3xl">{item.emoji}</span>
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
