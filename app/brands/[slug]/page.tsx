import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { fetchTenantConfig } from '../../lib/tenantConfig';
import { resolveUploadUrl } from '../../lib/apiClient';
import { formatPrice } from '../../lib/mockCatalog';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  brandId?: string;
  price: number;
  salePrice?: number | null;
  images?: string[];
  stock?: number;
}

async function fetchBrands(tenantId: string): Promise<Brand[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const res = await fetch(
      `${apiUrl}/api/brands/public?tenantId=${encodeURIComponent(tenantId)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? data.brands ?? []);
  } catch {
    return [];
  }
}

async function fetchProducts(tenantId: string): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const res = await fetch(
      `${apiUrl}/api/products/public?tenantId=${encodeURIComponent(tenantId)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);
  const { slug } = await params;
  const brandName = decodeURIComponent(slug).replace(/-/g, ' ').toUpperCase();
  return { title: `${brandName} | Брэнд | ${config?.branding?.name ?? 'Дэлгүүр'}` };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);
  const tenantId = config?.tenantId ?? '';
  const tenantQs = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : '';

  if (!tenantId || tenantId === 'default') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-400">Төслийн тохиргоо олдсонгүй.</p>
      </div>
    );
  }

  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [brands, products] = await Promise.all([fetchBrands(tenantId), fetchProducts(tenantId)]);
  console.log('[brand/[slug]] slug=', decodedSlug, 'brands=', brands.length, 'products=', products.length, 'tenantId=', tenantId);
  const normalizedSlug = decodedSlug.toLowerCase().trim();
  const brand = brands.find((b) => b.slug.toLowerCase().trim() === normalizedSlug);

  const brandProducts = products.filter((p) => {
    if (!p.brandId) return false;
    const bid = p.brandId.toLowerCase().trim();
    return bid === normalizedSlug || bid === brand?.slug.toLowerCase().trim() || bid === brand?.id.toLowerCase().trim();
  });

  if (!brand && brandProducts.length === 0) {
    notFound();
  }

  const primaryColor = config?.branding?.primaryColor ?? '#1565C0';
  const brandName = brand?.name ?? decodedSlug.replace(/-/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href={`/${tenantQs}`} className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <Link href={`/brands${tenantQs}`} className="hover:text-primary">Брэндүүд</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{brandName}</span>
      </nav>

      {/* Brand header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex items-center gap-6">
        {brand?.logo ? (
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center p-3 flex-shrink-0">
            <img src={resolveUploadUrl(brand.logo)} alt={brandName} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-3xl font-black flex-shrink-0" style={{ color: primaryColor }}>
            {brandName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black text-gray-800 mb-1">{brandName}</h1>
          <p className="text-gray-500 text-sm">
            {brandProducts.length > 0
              ? `${brandProducts.length} бараа байна`
              : 'Одоогоор бараа байхгүй байна'}
          </p>
        </div>
      </div>

      {brandProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-7xl mb-4 opacity-40">📦</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">{brandName} брэндийн бараанууд</h2>
          <p className="text-gray-400 mb-6 text-sm">Одоогоар бараа байхгүй байна.</p>
          <Link href={`/brands${tenantQs}`} className="inline-block font-bold px-8 py-3 rounded-xl transition-colors text-white" style={{ backgroundColor: primaryColor }}>
            Бүх брэнд харах
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {brandProducts.map((product) => {
            const image = resolveUploadUrl(product.images?.[0]);
            const isOnSale = !!product.salePrice;
            const displayPrice = product.salePrice ?? product.price;

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug || product.id}${tenantQs}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="relative h-40 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width:640px) 50vw, 25vw"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                  {isOnSale && (
                    <span className="absolute top-2 left-2 text-[10px] font-black text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: primaryColor }}>
                      SALE
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 text-[10px] font-black bg-gray-700 text-white px-1.5 py-0.5 rounded-full">
                      Дууссан
                    </span>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-xs font-bold text-gray-800 leading-tight line-clamp-2 flex-1">{product.name}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-black" style={{ color: primaryColor }}>
                      {formatPrice(displayPrice)}
                    </span>
                    {isOnSale && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
