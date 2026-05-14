import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORY_ICONS, CATEGORY_LABELS, formatPrice, getProductBySlug, getRelatedProducts } from '../../lib/mockCatalog';
import ProductDetailClient from './productDetailClient';
import Carousel from '../../components/Carousel';
import ProductCard from '../../components/ProductCard';

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  return { title: p ? `${p.name}` : 'Бүтээгдэхүүн | Их Наяд Плаза' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProductBySlug(slug);

  if (!p) {
    return (
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
  }

  const related = getRelatedProducts(p);
  const icon = CATEGORY_ICONS[p.category];
  const catLabel = CATEGORY_LABELS[p.category];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary">
          Нүүр
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-primary">
          Бүх бараа
        </Link>
        <span>/</span>
        <Link href={`/${p.category}`} className="hover:text-primary">
          {catLabel}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{p.name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <ProductDetailClient
          product={{
            id: p.id,
            slug: p.slug,
            name: p.name,
            brand: p.brand,
            category: p.category,
            categoryLabel: catLabel,
            icon,
            image: p.image,
            price: formatPrice(p.price),
            oldPrice: p.oldPrice ? formatPrice(p.oldPrice) : undefined,
            props: p.props,
          }}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Төстэй бараа</h2>
        <Carousel
          ariaLabel="Төстэй бараа"
          autoplayMs={7000}
          slides={chunk(related.length ? related : [p], 6).map((page, idx) => (
            <div key={idx} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
              {page.map((x) => (
                <ProductCard key={x.id} {...x} />
              ))}
            </div>
          ))}
        />
      </div>
    </div>
  );
}

