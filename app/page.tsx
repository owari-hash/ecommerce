import Link from 'next/link';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  type CatalogCategoryKey,
  formatPrice,
  MOCK_PRODUCTS,
} from './lib/mockCatalog';
import Carousel from './components/Carousel';

function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-black text-gray-900">{title}</h2>
      {right}
    </div>
  );
}

function BannerBlock({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="h-44 sm:h-52 bg-linear-to-r from-gray-900 via-slate-800 to-gray-900 text-white p-6 flex items-end justify-between">
        <div>
          <div className="text-xs font-black tracking-widest text-blue-200 uppercase">{title}</div>
          {subtitle && <div className="mt-2 text-sm text-blue-100 font-semibold">{subtitle}</div>}
        </div>
        <div className="text-6xl opacity-20">🧩</div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function ProductCarousel({ title }: { title: string }) {
  const pages = chunk(new Array(12).fill(null).map((_, i) => MOCK_PRODUCTS[i % MOCK_PRODUCTS.length]), 6);
  return (
    <div>
      <Carousel
        ariaLabel={title}
        autoplayMs={6000}
        slides={pages.map((page, pageIdx) => (
          <div key={pageIdx} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {page.map((p, i) => (
              <Link
                key={`${p.id}_${pageIdx}_${i}`}
                href={`/product/${p.slug}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="h-28 bg-gray-50 flex items-center justify-center text-4xl opacity-60">
                  {CATEGORY_ICONS[p.category]}
                </div>
                <div className="p-3">
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-wide mb-1">{p.brand}</div>
                  <div
                    className="text-xs font-bold text-gray-800 leading-snug"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {p.name}
                  </div>
                  <div className="mt-2 text-sm font-black text-gray-900">{formatPrice(p.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      />
    </div>
  );
}

function Tile({
  href,
  label,
  sub,
}: {
  href: string;
  label: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
    >
      <div className="h-full bg-gray-50 p-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Gaming</div>
          <div className="text-lg font-black text-gray-900 leading-tight mt-1">{label}</div>
          {sub && <div className="text-sm text-gray-500 font-semibold mt-1">{sub}</div>}
        </div>
        <div className="text-5xl opacity-35">🎯</div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const bigSlides = [
    {
      href: `/product/${MOCK_PRODUCTS[0].slug}`,
      title: 'PC-banner-1-4.jpg',
      subtitle: 'Acer Predator Helios Neo 16',
      emoji: '💻',
    },
    {
      href: '/s/computer',
      title: 'PC-banner.jpg',
      subtitle: 'Desktop / Parts',
      emoji: '🖥️',
    },
    {
      href: `/product/${MOCK_PRODUCTS[2].slug}`,
      title: 'PC-banner-2.jpg',
      subtitle: 'ASUS TUF Gaming RTX',
      emoji: '🧩',
    },
  ];

  const smallSlides = [
    { href: '/', title: 'Iphone_17_-_b----23.jpg', subtitle: 'Featured', emoji: '📱' },
    { href: '/brands/apple', title: 'Apple_Products-1.jpg', subtitle: 'Apple', emoji: '🍎' },
    { href: '/s/smartphone-and-tablet', title: 'Iphone_17_-_b-4.jpg', subtitle: 'iPhone / iPad', emoji: '📱' },
    { href: '/s/laptop', title: 'Macbook_Air.jpg', subtitle: 'MacBook Air', emoji: '💻' },
    { href: '/s/smartphone-and-tablet', title: 'Apple_Iphone_16.jpg', subtitle: 'Apple', emoji: '📱' },
  ];

  const sectionPlan: Array<
    | { kind: 'banner'; title: string; subtitle?: string; href?: string }
    | { kind: 'products'; title: string }
    | { kind: 'actions'; title: string }
    | { kind: 'banner1x2'; title: string }
  > = [
    { kind: 'banner', title: 'Prebuild Banner - NEW Production', subtitle: '(placeholder banner)', href: '/s/computer' },
    { kind: 'products', title: 'NEW ALL PRODUCTS' },
    { kind: 'banner', title: 'Hard Disk Banner - Part Production', subtitle: '(placeholder banner)', href: '/s/computer' },
    { kind: 'products', title: 'Part Product' },
    { kind: 'banner', title: 'Accessories Banner', subtitle: '(placeholder banner)', href: '/s/accessories' },
    { kind: 'products', title: 'Accessories' },
    { kind: 'banner', title: 'Pocket Zeel', subtitle: '(payment promo placeholder)', href: '/leasing-all' },
    { kind: 'products', title: 'STANDART LAPTOPS' },
    { kind: 'banner', title: 'Pocket Zeel', subtitle: '(payment promo placeholder)', href: '/leasing-all' },
    { kind: 'products', title: 'Gaming Laptop' },
    { kind: 'banner', title: 'Pocket Zeel', subtitle: '(payment promo placeholder)', href: '/leasing-all' },
    { kind: 'products', title: 'Macbook' },
    { kind: 'actions', title: '3 Action Button' },
    { kind: 'products', title: 'JBL - Covertoi' },
    { kind: 'banner1x2', title: 'Banner 1x2' },
    { kind: 'products', title: 'Beauty' },
    { kind: 'banner', title: 'Storepay Zeel', subtitle: '(payment promo placeholder)', href: '/leasing-all' },
    { kind: 'products', title: 'Electronics' },
  ];

  return (
    <div>
      {/* Banner 1x2 (two sliders placeholder) */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Carousel
              ariaLabel="Banner 1x2 (big)"
              autoplayMs={6500}
              slides={bigSlides.map((s) => (
                <Link
                  key={s.title}
                  href={s.href}
                  className="block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-72 bg-linear-to-r from-gray-900 via-slate-800 to-gray-900 text-white p-8 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-black tracking-widest text-blue-200 uppercase">{s.title}</div>
                      <div className="mt-2 text-3xl font-black leading-tight">{s.subtitle}</div>
                    </div>
                    <div className="text-7xl opacity-25">{s.emoji}</div>
                  </div>
                </Link>
              ))}
            />
          </div>

          <Carousel
            ariaLabel="Banner 1x2 (small)"
            autoplayMs={5500}
            slides={smallSlides.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white"
              >
                <div className="h-72 bg-linear-to-b from-white to-gray-50 p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-black tracking-widest text-gray-400 uppercase">{s.title}</div>
                    <div className="mt-2 text-xl font-black text-gray-900">{s.subtitle}</div>
                  </div>
                  <div className="text-7xl opacity-20 self-end">{s.emoji}</div>
                </div>
              </Link>
            ))}
          />
        </div>
      </div>

      {/* Gaming Category mosaic */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <h2 className="text-lg font-black text-gray-900 mb-4">Gaming Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <Tile href="/s/accessories" label="Gaming Accessories" sub="Mouse / Keyboard / Headset" />
          </div>
          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Tile href="/s/computer" label="Graphic Card" />
            <Tile href="/s/computer" label="Memory" />
            <Tile href="/s/computer" label="Processor" />
            <Tile href="/s/computer" label="Case" />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 gap-4">
            <Tile href="/s/laptop" label="Gaming Laptops" />
            <Tile href="/s/computer" label="Gaming Desktop" />
          </div>
        </div>
      </div>

      {/* Section blocks like Turbotech (repeatable) */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <SectionTitle
          title="NEW ALL PRODUCTS"
          right={
            <Link href="/s/laptop" className="text-sm font-bold text-primary hover:underline">
              Бүгдийг харах
            </Link>
          }
        />
        <ProductCarousel title="NEW ALL PRODUCTS" />
      </div>

      {/* Missing Turbotech sections (structure placeholders) */}
      <div className="max-w-7xl mx-auto px-4 mt-10 space-y-10">
        {sectionPlan.map((s, i) => {
          if (s.kind === 'banner') {
            return (
              <div key={`${s.kind}_${s.title}_${i}`}>
                <SectionTitle title={s.title} />
                <BannerBlock title={s.title} subtitle={s.subtitle} href={s.href} />
              </div>
            );
          }
          if (s.kind === 'products') {
            return (
              <div key={`${s.kind}_${s.title}_${i}`}>
                <SectionTitle title={s.title} />
                <ProductCarousel title={s.title} />
              </div>
            );
          }
          if (s.kind === 'actions') {
            return (
              <div key={`${s.kind}_${s.title}_${i}`}>
                <SectionTitle title={s.title} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    href="/leasing-form"
                    className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 hover:shadow-md transition-all"
                  >
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Action</div>
                    <div className="mt-2 text-lg font-black text-gray-900">Лизинг хүсэлт</div>
                    <div className="mt-1 text-sm text-gray-500 font-semibold">Apply now</div>
                  </Link>
                  <Link
                    href="/delivery"
                    className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 hover:shadow-md transition-all"
                  >
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Action</div>
                    <div className="mt-2 text-lg font-black text-gray-900">Хүргэлт</div>
                    <div className="mt-1 text-sm text-gray-500 font-semibold">Delivery info</div>
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 hover:shadow-md transition-all"
                  >
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Action</div>
                    <div className="mt-2 text-lg font-black text-gray-900">Холбоо барих</div>
                    <div className="mt-1 text-sm text-gray-500 font-semibold">Contact</div>
                  </Link>
                </div>
              </div>
            );
          }
          return (
            <div key={`${s.kind}_${s.title}_${i}`}>
              <SectionTitle title={s.title} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <BannerBlock title={s.title} subtitle="(left big placeholder)" href="/" />
                <BannerBlock title={s.title} subtitle="(right placeholder)" href="/" />
                <BannerBlock title={s.title} subtitle="(right placeholder)" href="/" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick category row (mirrors bottom nav categories) */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-lg font-black text-gray-900 mb-4">Ангилал</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {(Object.keys(CATEGORY_LABELS) as CatalogCategoryKey[]).map((k) => (
            <Link
              key={k}
              href={`/s/${k}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-3"
            >
              <div className="text-2xl">{CATEGORY_ICONS[k]}</div>
              <div className="text-sm font-bold text-gray-800">{CATEGORY_LABELS[k]}</div>
            </Link>
          ))}
          <Link
            href="/brands"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-3"
          >
            <div className="text-2xl">🏷️</div>
            <div className="text-sm font-bold text-gray-800">Брэнд</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
