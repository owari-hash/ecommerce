import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchTenantConfig } from '../../lib/tenantConfig'
import { PageRenderer } from '../../lib/pageRenderer'

const KNOWN_STORES = ['foodcity', 'goto-market', 'ikhnayd']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ store: string }>
}): Promise<Metadata> {
  const { store } = await params
  const headersList = await headers()
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost'
  const config = await fetchTenantConfig(host, store)
  const name = config?.branding?.name ?? store
  return { title: `${name} — Preview` }
}

export default async function PreviewStorePage({
  params,
}: {
  params: Promise<{ store: string }>
}) {
  const { store } = await params

  if (!KNOWN_STORES.includes(store)) {
    notFound()
  }

  const headersList = await headers()
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost'
  const config = await fetchTenantConfig(host, store)

  if (!config) {
    notFound()
  }

  const storeLabels: Record<string, string> = {
    foodcity: 'FoodCity',
    'goto-market': 'GoTo Market',
    ikhnayd: 'Их Наяд',
  }

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm font-semibold text-amber-800 tracking-wide">
        Static Preview — {storeLabels[store] ?? store}
        <span className="ml-3 text-xs font-normal text-amber-600">
          (mock data, no backend required)
        </span>
      </div>
      <PageRenderer sections={config.theme.homepageSections} />
    </>
  )
}
