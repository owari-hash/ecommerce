import Link from 'next/link';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchTenantConfig } from '../lib/tenantConfig';
import { resolveUploadUrl } from '../lib/apiClient';

export const metadata: Metadata = { title: 'Брэндүүд' };

interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
}

async function fetchBrands(tenantId: string): Promise<Brand[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    const res = await fetch(
      `${apiUrl}/api/brands/public?tenantId=${encodeURIComponent(tenantId)}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.data ?? data.brands ?? [])
  } catch {
    return []
  }
}

export default async function BrandsPage() {
  const headersList = await headers()
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost'
  const tenantSlug = headersList.get('x-tenant-slug')
  const config = await fetchTenantConfig(host, tenantSlug)
  const tenantId = config?.tenantId ?? ''
  const brands = tenantId && tenantId !== 'default' ? await fetchBrands(tenantId) : []
  const tenantQs = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : ''

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-28 md:pb-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Брэндүүд</span>
      </nav>

      <h1 className="text-2xl font-black text-gray-800 mb-8">Брэндүүд</h1>

      {brands.length === 0 ? (
        <p className="text-gray-400 text-sm">Брэнд олдсонгүй.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}${tenantQs}`}
              className="bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all p-5 flex flex-col items-center justify-center gap-3 group min-h-[100px]"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                {brand.logo ? (
                  <img src={resolveUploadUrl(brand.logo)} alt={brand.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-xl font-black text-primary">{brand.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="text-xs font-bold text-gray-700 text-center group-hover:text-primary transition-colors leading-tight">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
