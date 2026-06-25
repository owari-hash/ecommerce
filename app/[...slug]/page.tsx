import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchTenantConfig } from '../lib/tenantConfig';
import { formatPrice } from '../lib/mockCatalog';
import { resolveUploadUrl } from '../lib/apiClient';
import CategoryListingClient from './listingClient';
import React from 'react';

const CATEGORY_BANNER_IMAGES: Record<string, string> = {
  laptop:                 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&h=400&fit=crop',
  computer:               'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1400&h=400&fit=crop',
  'smartphone-and-tablet':'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1400&h=400&fit=crop',
  console:                'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1400&h=400&fit=crop',
  'audio-equipment':      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&h=400&fit=crop',
  home:                   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&h=400&fit=crop',
  accessories:            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1400&h=400&fit=crop',
};

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=400&fit=crop';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryKey = decodeURIComponent(slug[slug.length - 1]);

  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);

  let label = 'Бараа';
  if (config) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      const catRes = await fetch(`${apiUrl}/api/categories/public?tenantId=${config.tenantId}`, { cache: 'no-store' });
      const catBody = await catRes.json();
      const matchedCat = catBody?.data?.find((c: any) => c.slug === categoryKey);
      if (matchedCat) label = matchedCat.name;
    } catch (e) {
      console.error(e);
    }
  }

  return { title: `${label} | ${config?.branding?.name ?? 'Дэлгүүр'}` };
}

export default async function CatchAllShopPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const categoryKey = decodeURIComponent(slug[slug.length - 1]);

  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);

  if (!config) {
    return <div>Сайт олдсонгүй</div>;
  }

  let label = 'Бүтээгдэхүүний хайлтын үр дүн';
  let matchedCategoryId = '';
  let categories: any[] = [];
  let rawProducts: any[] = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const [catRes, prodRes] = await Promise.all([
      fetch(`${apiUrl}/api/categories/public?tenantId=${config.tenantId}`, { cache: 'no-store' }),
      fetch(`${apiUrl}/api/products/public?tenantId=${config.tenantId}`, { cache: 'no-store' })
    ]);

    if (catRes.ok) {
      const catBody = await catRes.json();
      categories = catBody?.data || [];
      const matchedCat = categories.find((c: any) => c.slug === categoryKey);
      if (matchedCat) {
        label = matchedCat.name;
        matchedCategoryId = matchedCat.id;
      }
    }

    if (prodRes.ok) {
      const prodBody = await prodRes.json();
      rawProducts = prodBody?.data || [];
    }
  } catch (e) {
    console.error('Failed to fetch dynamic server data:', e);
  }

  // Collect all descendant category IDs so parent pages show child products too
  function collectDescendantIds(parentId: string, allCats: any[]): string[] {
    const ids: string[] = [];
    const queue = [parentId];
    while (queue.length) {
      const current = queue.shift()!;
      ids.push(current);
      allCats.filter((c) => c.parentId === current).forEach((c) => queue.push(c.id));
    }
    return ids;
  }

  const categoryIds = matchedCategoryId
    ? new Set(collectDescendantIds(matchedCategoryId, categories))
    : new Set<string>();

  const filteredProducts = rawProducts.filter(
    (p: any) => categoryIds.has(p.categoryId) || p.categoryId === categoryKey
  );

  const matchedCat = categories.find((c: any) => c.slug === categoryKey);
  let bannerImage = CATEGORY_BANNER_IMAGES[categoryKey] || DEFAULT_BANNER;
  if (matchedCat) {
    let catBanner = matchedCat.banner;
    // Fallback to parent banner if subcategory has no banner
    if (!catBanner && matchedCat.parentId) {
      const parentCat = categories.find((c: any) => c.id === matchedCat.parentId);
      if (parentCat && parentCat.banner) {
        catBanner = parentCat.banner;
      }
    }
    // Fallback to own image/icon
    if (!catBanner) {
      catBanner = matchedCat.image;
    }
    // Fallback to parent image/icon
    if (!catBanner && matchedCat.parentId) {
      const parentCat = categories.find((c: any) => c.id === matchedCat.parentId);
      if (parentCat && parentCat.image) {
        catBanner = parentCat.image;
      }
    }

    if (catBanner) {
      bannerImage = resolveUploadUrl(catBanner) || bannerImage;
    }
  }

  const categoryNameMap = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <div className="pb-8">
      <h1 className="sr-only">Бүтээгдэхүүний хайлтын үр дүн</h1>

      {/* Top banner with image background - full width */}
      <div className="relative w-full h-64 sm:h-80 md:h-[380px] mb-6 overflow-hidden">
        <Image
          src={bannerImage}
          alt={label}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
      </div>

      <div className="w-full px-4 md:px-8 max-w-none">
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumbs" className="text-xs sm:text-sm text-gray-500 mb-6 flex items-center gap-1.5 uppercase font-bold tracking-wider">
          <Link href="/" className="hover:text-primary transition-colors">
            Нүүр
          </Link>
          {slug.map((s, i) => {
            const decoded = decodeURIComponent(s);
            return (
              <React.Fragment key={i}>
                <span className="text-gray-300">/</span>
                <span className={i === slug.length - 1 ? "text-gray-900" : "text-gray-500"}>
                  {categoryNameMap.get(decoded) || decoded}
                </span>
              </React.Fragment>
            );
          })}
        </nav>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-7xl mb-4 opacity-40">📦</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Бараа байхгүй байна</h2>
            <p className="text-gray-400 mb-6 text-sm">Энэ ангилалд одоогоор бараа байхгүй байна</p>
            <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Нүүр хуудас руу буцах
            </Link>
          </div>
        ) : (
          <CategoryListingClient
            category={{ key: categoryKey, label, icon: '📦', id: matchedCategoryId }}
            products={filteredProducts.map((p: any) => ({
              id: p.id,
              slug: p.slug || p.id,
              name: p.name,
              brand: (p.brandId && p.brandId !== 'br1') ? p.brandId : 'Дэлгүүр',
              price: formatPrice(p.salePrice ? p.salePrice : p.price),
              oldPrice: p.salePrice ? formatPrice(p.price) : undefined,
              badge: p.featured ? 'Шинэ' : p.salePrice ? 'Хямдрал' : null,
              image: p.images?.[0],
              stock: p.stock ?? 0,
            }))}
            categories={categories}
            allProducts={rawProducts}
            currentCategoryId={matchedCategoryId}
          />
        )}
      </div>
    </div>
  );
}
