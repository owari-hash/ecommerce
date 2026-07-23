'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { resolveUploadUrl } from '../lib/apiClient'
import { useTenantHref } from '../lib/useTenantHref'

interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
}

interface BrandListProps {
  title?: string
  limit?: number
  tenantId?: string
}

export default function BrandList({ title = 'Брэндүүд', limit = 12, tenantId }: BrandListProps) {
  const tenantHref = useTenantHref()
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    if (!tenantId || tenantId === 'default') return
    fetch(`/api/brands/public?tenantId=${encodeURIComponent(tenantId)}`)
      .then((r) => r.ok ? r.json() : { data: [] })
      .then((data) => {
        const list: Brand[] = Array.isArray(data) ? data : (data.data ?? data.brands ?? [])
        setBrands(list.slice(0, limit))
      })
      .catch(() => {})
  }, [tenantId, limit])

  if (brands.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 min-w-0 truncate">{title}</h2>
        <Link href={tenantHref('/brands')} className="shrink-0 text-sm font-bold text-primary hover:underline">
          Бүгдийг харах
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={tenantHref(`/brands/${brand.slug}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-primary text-sm font-bold text-gray-700 hover:text-primary transition-all"
          >
            {brand.logo && (
              <img src={resolveUploadUrl(brand.logo)} alt={brand.name} className="w-5 h-5 object-contain rounded" />
            )}
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
