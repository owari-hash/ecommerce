import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORY_ICONS, CATEGORY_LABELS, formatPrice, getProductBySlug, getRelatedProducts } from '../../lib/mockCatalog';
import ProductDetailClient from './productDetailClient';
import Carousel from '../../components/Carousel';

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
  return { title: p ? `${p.name}` : 'Бүтээгдэхүүн | Turbotech' };
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
        <Link href="/s" className="hover:text-primary">
          Бүх бараа
        </Link>
        <span>/</span>
        <Link href={`/s/${p.category}`} className="hover:text-primary">
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
            <div key={idx} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {page.map((x) => (
                <Link
                  key={x.id}
                  href={`/product/${x.slug}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="h-28 bg-gray-50 flex items-center justify-center text-4xl opacity-60">
                    {CATEGORY_ICONS[x.category]}
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
                      {x.brand}
                    </div>
                    <div
                      className="text-xs font-semibold text-gray-800 leading-snug"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {x.name}
                    </div>
                    <div className="mt-2 text-sm font-black text-gray-900">{formatPrice(x.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        />
      </div>
    </div>
  );
}

