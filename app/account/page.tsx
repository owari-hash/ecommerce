import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchTenantConfig } from '../lib/tenantConfig';
import AccountClient from './AccountClient';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);
  return { title: `Бүртгэл | ${config?.branding?.name ?? 'Дэлгүүр'}` };
}

export default function AccountPage() {
  return <AccountClient />;
}
