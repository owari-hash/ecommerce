import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { fetchTenantConfig } from './lib/tenantConfig'
import { PageRenderer } from './lib/pageRenderer'

export default async function HomePage() {
  const headersList = await headers()
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost'
  const tenantSlug = headersList.get('x-tenant-slug')
  // fetchTenantConfig is memoized via React cache() — layout.tsx already called it, this is a cache hit
  const config = await fetchTenantConfig(host, tenantSlug)

  if (!config) {
    notFound()
  }

  return <PageRenderer sections={config.theme.homepageSections} tenantId={config.tenantId} />
}
