import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchTenantConfig } from '../lib/tenantConfig';
import ComparePageClient from './pageClient';

export const metadata: Metadata = { title: 'Харьцуулах' };

export default async function ComparePage() {
  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);

  return <ComparePageClient tenantId={config?.tenantId ?? ''} />;
}
