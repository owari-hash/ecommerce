import Link from 'next/link';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchTenantConfig } from '../../lib/tenantConfig';
import { CATEGORY_ICONS, formatPrice } from '../../lib/mockCatalog';
import ProductDetailClient from './productDetailClient';
import Carousel from '../../components/Carousel';
import ProductCard from '../../components/ProductCard';

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchProductData(tenantId: string, slugOrId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const [prodRes, catRes] = await Promise.all([
    fetch(`${apiUrl}/api/products/public?tenantId=${tenantId}`, { cache: 'no-store' }),
    fetch(`${apiUrl}/api/categories/public?tenantId=${tenantId}`, { cache: 'no-store' }),
  ]);

  const products: any[] = prodRes.ok ? (await prodRes.json())?.data ?? [] : [];
  const categories: any[] = catRes.ok ? (await catRes.json())?.data ?? [] : [];

  const product = products.find(
    (p: any) => p.slug === slugOrId || p.id === slugOrId ||
      p.slug === decodeURIComponent(slugOrId) || p.id === decodeURIComponent(slugOrId),
  );

  return { product, products, categories };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);

  if (config) {
    try {
      const { product } = await fetchProductData(config.tenantId, slug);
      if (product) return { title: `${product.name}` };
    } catch {/* fall through */}
  }

  return { title: 'Бүтээгдэхүүн' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const headersList = await headers();
  const host = headersList.get('x-tenant-host') ?? headersList.get('host') ?? 'localhost';
  const tenantSlug = headersList.get('x-tenant-slug');
  const config = await fetchTenantConfig(host, tenantSlug);

  const notFound = (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="text-7xl mb-4 opacity-40">🔎</div>
        <h1 className="text-xl font-bold text-gray-700 mb-2">Бүтээгдэхүүн олдсонгүй</h1>
        <p className="text-gray-400 mb-6 text-sm">Илүү дэлгэрэнгүй хайлт хийнэ үү</p>
        <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl">
          Нүүр хуудас
        </Link>
      </div>
    </div>
  );

  if (!config) return notFound;

  let p: any = null;
  let allProducts: any[] = [];
  let categories: any[] = [];

  try {
    const result = await fetchProductData(config.tenantId, slug);
    p = result.product;
    allProducts = result.products;
    categories = result.categories;
  } catch {
    return notFound;
  }

  if (!p) return notFound;

  const category = categories.find((c: any) => c.id === p.categoryId);
  const categorySlug = category?.slug ?? '';
  const categoryLabel = category?.name ?? 'Ангилал';
  const icon = CATEGORY_ICONS[categorySlug as keyof typeof CATEGORY_ICONS] ?? '📦';

  const specs: Array<{ k: string; v: string }> = p.specifications
    ? Object.entries(p.specifications as Record<string, unknown>).map(([k, v]) => ({ k, v: String(v) }))
    : [];

  // Related: same category, excluding this product
  const related = allProducts
    .filter((x: any) => x.categoryId === p.categoryId && x.id !== p.id)
    .slice(0, 12);

  const relatedVMs = related.map((x: any) => ({
    id: x.id,
    slug: x.slug || x.id,
    name: x.name,
    brand: (x.brandId && x.brandId !== 'br1') ? x.brandId : (config?.branding?.name ?? ''),
    price: x.salePrice ?? x.price,
    oldPrice: x.salePrice ? x.price : undefined,
    isNew: !!x.featured,
    isSale: !!x.salePrice,
    image: x.images?.[0],
    category: (categorySlug || 'accessories') as any,
    stock: x.stock ?? 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-primary">Бүх бараа</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/${categorySlug}`} className="hover:text-primary">{categoryLabel}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-800 font-medium">{p.name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <ProductDetailClient
          product={{
            id: p.id,
            slug: p.slug || p.id,
            name: p.name,
            description: p.description || '',
            brand: (p.brandId && p.brandId !== 'br1') ? p.brandId : (config?.branding?.name ?? ''),
            category: categorySlug,
            categoryLabel,
            icon,
            image: p.images?.[0],
            images: p.images || [],
            price: formatPrice(p.salePrice ?? p.price),
            oldPrice: p.salePrice ? formatPrice(p.price) : undefined,
            props: specs,
            stock: p.stock ?? 0,
            isPosLinked: p.isPosLinked,
          }}
        />
      </div>

      {relatedVMs.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">Төстэй бараа</h2>
              <p className="text-sm text-gray-400 mt-0.5">{categoryLabel} ангиллын бусад бараанууд</p>
            </div>
            <Link
              href={`/${categorySlug}`}
              className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
            >
              Бүгдийг үзэх
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {relatedVMs.map((x) => (
              <ProductCard key={x.id} {...x} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
