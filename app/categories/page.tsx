'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTenant } from '../lib/TenantContext'
import { useTenantHref } from '../lib/useTenantHref'
import { getCategorySlug } from '../lib/categoryUtils'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  status: string
}

export default function CategoriesPage() {
  const { tenantId } = useTenant()
  const tenantHref = useTenantHref()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000')
    fetch(`${apiUrl}/api/categories/public?tenantId=${tenantId}`)
      .then((res) => res.json())
      .then((body) => {
        if (body && body.data) {
          setCategories(body.data.filter((c: Category) => c.status === 'active'))
        }
      })
      .catch((err) => console.error('Failed to fetch categories', err))
      .finally(() => setLoading(false))
  }, [tenantId])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">
          Нүүр
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Ангилал</span>
      </nav>

      <h1 className="text-2xl font-black text-gray-800 mb-6">Ангилал</h1>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-white border border-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={tenantHref(`/${getCategorySlug(c)}`)}
                  className="flex items-center justify-between px-5 py-4 hover:bg-blue-50 hover:text-[#1565C0] transition-colors"
                >
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className="text-gray-300">›</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/brands"
                className="flex items-center justify-between px-5 py-4 hover:bg-blue-50 hover:text-[#1565C0] transition-colors"
              >
                <span className="font-medium text-sm">Брэндүүд</span>
                <span className="text-gray-300">›</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

