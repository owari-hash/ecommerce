import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchTenantConfig } from '../../lib/tenantConfig';
import { Suspense } from 'react';
import OrdersClient from '../orders/OrdersClient';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);
  return { title: `Захиалгын түүх | ${config?.branding?.name ?? 'Дэлгүүр'}` };
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-gray-400">Ачаалж байна...</div>}>
      <OrdersClient />
    </Suspense>
  );
}
