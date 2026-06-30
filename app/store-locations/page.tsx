import Link from 'next/link';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchTenantConfig, type TenantLocation } from '../lib/tenantConfig';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);
  return { title: `Салбар дэлгүүр | ${config?.branding?.name ?? 'Дэлгүүр'}` };
}

export default async function StoreLocationsPage() {
  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);

  const locations: TenantLocation[] = config?.locations ?? [];
  const primaryColor = config?.branding?.primaryColor ?? '#D32F2F';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Салбар дэлгүүр</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Салбар дэлгүүр</h1>

      {locations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-6xl mb-4 opacity-30">🏪</div>
          <p className="text-gray-400 text-sm">Салбар дэлгүүрийн мэдээлэл удахгүй нэмэгдэнэ.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {locations.map((store, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  🏪
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-800 mb-1">{store.name}</h2>
                  {store.district && (
                    <p className="text-xs font-medium mb-3" style={{ color: primaryColor }}>
                      {store.district}
                    </p>
                  )}
                  <div className="space-y-2 text-sm text-gray-600">
                    {store.address && (
                      <div className="flex items-start gap-2">
                        <span className="text-base mt-0.5 shrink-0">📍</span>
                        <span>{store.address}</span>
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-base shrink-0">📞</span>
                        <a
                          href={`tel:${store.phone.replace(/[\s-]/g, '')}`}
                          className="font-medium hover:underline"
                          style={{ color: primaryColor }}
                        >
                          {store.phone}
                        </a>
                      </div>
                    )}
                    {store.hours && (
                      <div className="flex items-center gap-2">
                        <span className="text-base shrink-0">🕐</span>
                        <span>{store.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map placeholder — uses first location's address as label */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 h-64 flex flex-col items-center justify-center gap-3">
          <span className="text-6xl">🗺️</span>
          {locations[0] ? (
            <>
              <p className="text-gray-500 font-medium">{locations[0].district || locations[0].address}</p>
              <p className="text-sm text-gray-400">{locations[0].name}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Байршил оруулаагүй байна</p>
          )}
        </div>
      </div>
    </div>
  );
}
