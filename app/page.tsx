import Link from 'next/link';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  type CatalogCategoryKey,
  MOCK_PRODUCTS,
} from './lib/mockCatalog';
import Carousel from './components/Carousel';
import GroceryBentoMobile from './components/GroceryBentoMobile';
import ProductCard from './components/ProductCard';
import ServiceBento from './components/ServiceBento';
import ElectroBorder from './components/ElectroBorder';

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

function ImageBanner({
  title,
  subtitle,
  href,
  fullWidth,
  image,
  emoji,
  overlayDir = 'right',
}: {
  title: string;
  subtitle?: string;
  href?: string;
  fullWidth?: boolean;
  image: string;
  emoji?: string;
  overlayDir?: 'right' | 'top' | 'bottom';
}) {
  const gradients: Record<string, string> = {
    right: 'bg-gradient-to-r from-black/80 via-black/60 to-black/20',
    top: 'bg-gradient-to-b from-black/70 via-black/40 to-black/20',
    bottom: 'bg-gradient-to-t from-black/80 via-black/40 to-black/10',
  };
  const content = (
    <div className={`relative overflow-hidden ${fullWidth ? 'w-full h-52 sm:h-64 md:h-80' : 'h-44 sm:h-52 rounded-2xl border border-gray-100 shadow-sm'}`}>
      <img src={image} alt={subtitle ?? title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className={`absolute inset-0 ${gradients[overlayDir]}`} />
      <div className={`relative h-full flex items-end justify-between ${fullWidth ? 'px-5 sm:px-10 lg:px-16 py-6 sm:py-8' : 'p-5'}`}>
        <div>
          <div className="text-xs font-black tracking-widest uppercase text-red-300">{title}</div>
          {subtitle && <div className={`font-semibold text-white ${fullWidth ? 'mt-2 text-lg sm:text-2xl' : 'mt-1.5 text-sm'}`}>{subtitle}</div>}
        </div>
        {emoji && <div className={`opacity-25 ${fullWidth ? 'text-6xl sm:text-8xl' : 'text-5xl'}`}>{emoji}</div>}
      </div>
    </div>
  );
  return href ? <Link href={href} className={fullWidth ? 'block' : ''}>{content}</Link> : content;
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
          <div key={pageIdx} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
            {page.map((p, i) => (
              <ProductCard key={`${p.id}_${pageIdx}_${i}`} {...p} />
            ))}
          </div>
        ))}
      />
    </div>
  );
}

function Tile({ href, label, sub, image }: { href: string; label: string; sub?: string; image: string }) {
  return (
    <Link href={href} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all relative block">
      <img src={image} alt={label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="relative h-36 sm:h-44 md:h-52 p-3 sm:p-4 flex items-end justify-between gap-2 text-white">
        <div>
          <div className="text-xs font-black text-red-300 uppercase tracking-widest">Gaming</div>
          <div className="text-sm sm:text-base font-black leading-tight mt-0.5">{label}</div>
          {sub && <div className="text-xs text-gray-300 font-semibold mt-0.5">{sub}</div>}
        </div>
        <div className="text-3xl sm:text-4xl opacity-35">🎮</div>
      </div>
    </Link>
  );
}

// ── Grocery bento mosaic ─────────────────────────────────────────────────────
const GROCERY_TILES = [
  {
    id: 'fresh',
    label: 'Шинэ жимс & ногоо',
    sub: 'Fresh Produce',
    href: '/grocery/fresh-fruits',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&h=420&fit=crop',
    area: 'fresh',
  },
  {
    id: 'store',
    label: 'Хүнсний дэлгүүр',
    sub: 'Grocery Store',
    href: '/grocery',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&h=420&fit=crop',
    area: 'store',
  },
  {
    id: 'dairy',
    label: 'Сүүн бүтээгдэхүүн',
    sub: 'Dairy & Eggs',
    href: '/grocery/dairy-eggs',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=420&fit=crop',
    area: 'dairy',
  },
  {
    id: 'meat',
    label: 'Мах & Шувуу',
    sub: 'Meat & Poultry',
    href: '/grocery/meat-poultry',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&h=380&fit=crop',
    area: 'meat',
  },
  {
    id: 'seafood',
    label: 'Далайн хүнс',
    sub: 'Seafood',
    href: '/grocery/seafood',
    image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500&h=380&fit=crop',
    area: 'seafood',
  },
  {
    id: 'veg',
    label: 'Органик ногоо',
    sub: 'Organic Vegetables',
    href: '/grocery/vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&h=600&fit=crop',
    area: 'veg',
  },
  {
    id: 'bakery',
    label: 'Бэйкери',
    sub: 'Bread & Pastry',
    href: '/grocery/bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&h=420&fit=crop',
    area: 'bakery',
  },
  {
    id: 'drinks',
    label: 'Уух зүйлс',
    sub: 'Beverages',
    href: '/grocery/beverages',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=380&fit=crop',
    area: 'drinks',
  },
  {
    id: 'snacks',
    label: 'Хөнгөн зууш',
    sub: 'Snacks',
    href: '/grocery/snacks',
    image: 'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=500&h=380&fit=crop',
    area: 'snacks',
  },
];

type GroceryTile = typeof GROCERY_TILES[0];

function BentoCard({ tile, className, style }: { tile: GroceryTile; className?: string; style?: React.CSSProperties }) {
  return (
    <Link
      href={tile.href}
      className={`group relative overflow-hidden rounded-2xl bg-[#161b22] border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/60 ${className ?? ''}`}
      style={style}
    >
      <img
        src={tile.image}
        alt={tile.label}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
      <div className="relative h-full p-4 flex flex-col justify-end">
        <p className="text-[10px] font-black uppercase tracking-[3px] text-primary mb-1">{tile.sub}</p>
        <h3 className="text-sm font-black uppercase tracking-wide text-white leading-tight">{tile.label}</h3>
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-primary group-hover:text-primary-light transition-colors">
          Дэлгэрэнгүй
          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function GroceryBento() {
  const byId = Object.fromEntries(GROCERY_TILES.map(t => [t.id, t]));

  return (
    <section className="bg-[#0d1117] py-8 sm:py-10 mt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            🛒 Хүнсний ангилал
          </h2>
          <Link href="/grocery" className="text-sm font-bold text-primary hover:text-primary-light transition-colors">
            Бүгдийг харах →
          </Link>
        </div>

        {/*
          Desktop — two independent flex columns so row breaks NEVER align.
          Left col (50%):  fresh(200) → [meat+seafood](250) → bakery(250)
          Right col (50%): [dairy+veg](280) → store(240) → [drinks+snacks](180)
          Total left  ≈ 710px   Total right ≈ 710px  (gap excluded, heights match overall)
        */}
        <div className="hidden md:flex gap-2.5">
          {/* ── LEFT column ── */}
          <div className="flex flex-col gap-2.5 flex-1">
            {/* wide top tile */}
            <BentoCard tile={byId.fresh} style={{ height: 200 }} />

            {/* two side-by-side tiles */}
            <div className="flex gap-2.5" style={{ height: 250 }}>
              <BentoCard tile={byId.meat}    className="flex-1" />
              <BentoCard tile={byId.seafood} className="flex-1" />
            </div>

            {/* wide bottom tile */}
            <BentoCard tile={byId.bakery} style={{ height: 250 }} />
          </div>

          {/* ── RIGHT column ── */}
          <div className="flex flex-col gap-2.5 flex-1">
            {/* two side-by-side tiles — taller than left-top */}
            <div className="flex gap-2.5" style={{ height: 280 }}>
              <BentoCard tile={byId.dairy} className="flex-1" />
              <BentoCard tile={byId.veg}   className="flex-1" />
            </div>

            {/* wide full-width tile */}
            <BentoCard tile={byId.store} style={{ height: 240 }} />

            {/* two side-by-side tiles — shorter */}
            <div className="flex gap-2.5" style={{ height: 180 }}>
              <BentoCard tile={byId.drinks} className="flex-1" />
              <BentoCard tile={byId.snacks} className="flex-1" />
            </div>
          </div>
        </div>

        {/* Mobile — slideshow carousels */}
        <GroceryBentoMobile tiles={GROCERY_TILES} />
      </div>
    </section>
  );
}

const BIG_SLIDES = [
  {
    href: `/product/${MOCK_PRODUCTS[0].slug}`,
    title: 'Шинэ ирэлт',
    subtitle: 'Acer Predator Helios Neo 16',
    emoji: '💻',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=600&fit=crop',
  },
  {
    href: '/computer',
    title: 'Суурин компьютер',
    subtitle: 'Desktop & Parts',
    emoji: '🖥️',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&h=600&fit=crop',
  },
  {
    href: `/product/${MOCK_PRODUCTS[2].slug}`,
    title: 'Gaming Graphics',
    subtitle: 'ASUS TUF Gaming RTX 4090',
    emoji: '🧩',
    image: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=1200&h=600&fit=crop',
  },
];

const SMALL_SLIDES = [
  {
    href: '/',
    title: 'Онцлох бараа',
    subtitle: 'iPhone 17 Pro',
    emoji: '📱',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=700&fit=crop',
  },
  {
    href: '/brands/apple',
    title: 'Apple',
    subtitle: 'Apple Ecosystem',
    emoji: '🍎',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=700&fit=crop',
  },
  {
    href: '/smartphone-and-tablet',
    title: 'Ухаалаг төхөөрөмж',
    subtitle: 'iPhone / iPad',
    emoji: '📱',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=700&fit=crop',
  },
  {
    href: '/laptop',
    title: 'MacBook Air',
    subtitle: 'M3 Chip · All‑day battery',
    emoji: '💻',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=700&fit=crop',
  },
  {
    href: '/smartphone-and-tablet',
    title: 'Samsung Galaxy',
    subtitle: 'Galaxy S25 Ultra',
    emoji: '📱',
    image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&h=700&fit=crop',
  },
];

const SECTION_BANNERS: Record<number, string> = {
  0: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=1400&h=400&fit=crop', // prebuild PC
  2: 'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=1400&h=400&fit=crop', // HDD/storage
  4: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1400&h=400&fit=crop', // accessories
  6: 'https://images.unsplash.com/photo-1604156425963-9be03f86a428?w=1400&h=400&fit=crop', // payment
  8: 'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?w=1400&h=400&fit=crop', // gaming laptop
  10: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&h=400&fit=crop', // MacBook
  16: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1400&h=400&fit=crop', // electronics
};

const SECTION_EMOJIS: Record<number, string> = {
  0: '🖥️', 2: '💾', 4: '🖱️', 6: '💳', 8: '🎮', 10: '💻', 16: '📺',
};

const TILE_IMAGES = [
  'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&h=400&fit=crop', // accessories
  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop', // GPU
  'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=300&fit=crop',   // RAM
  'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400&h=300&fit=crop', // CPU
  'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop', // case
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop', // gaming laptop
  'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400&h=300&fit=crop',   // gaming desktop
];

const BANNER1X2_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop', // headphones
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop', // tech lifestyle
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop', // camera
];

export default function HomePage() {
  const sectionPlan: Array<
    | { kind: 'banner'; title: string; subtitle?: string; href?: string }
    | { kind: 'products'; title: string }
    | { kind: 'actions'; title: string }
    | { kind: 'banner1x2'; title: string }
  > = [
    { kind: 'banner', title: 'Prebuild PC', subtitle: 'Шинэ угсралттай компьютер', href: '/computer' },
    { kind: 'products', title: 'Бүх шинэ бараа' },
    { kind: 'banner', title: 'Storage & Parts', subtitle: 'HDD · SSD · RAM · CPU', href: '/computer' },
    { kind: 'products', title: 'Компьютерийн эд анги' },
    { kind: 'banner', title: 'Accessories', subtitle: 'Дагалдах хэрэгсэл', href: '/accessories' },
    { kind: 'products', title: 'Дагалдах хэрэгсэл' },
    { kind: 'banner', title: 'Pocket Зээл', subtitle: 'Хялбар, хурдан лизинг', href: '/leasing-all' },
    { kind: 'products', title: 'Стандарт зөөврийн компьютер' },
    { kind: 'banner', title: 'Gaming Zone', subtitle: 'Gaming Laptop шинэ ирэлт', href: '/leasing-all' },
    { kind: 'products', title: 'Gaming Laptop' },
    { kind: 'banner', title: 'MacBook', subtitle: 'MacBook Air M3 · MacBook Pro', href: '/leasing-all' },
    { kind: 'products', title: 'MacBook' },
    { kind: 'actions', title: '3 Action Button' },
    { kind: 'products', title: 'JBL & Audio' },
    { kind: 'banner1x2', title: 'Banner 1x2' },
    { kind: 'products', title: 'Гоо сайхан' },
    { kind: 'banner', title: 'Electronics Sale', subtitle: 'Хямдралтай электроник', href: '/leasing-all' },
    { kind: 'products', title: 'Электроникс' },
  ];

  return (
    <div>
      {/* Hero carousel — big left + small right */}
      <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Big carousel */}
          <div className="lg:col-span-2">
            <Carousel
              ariaLabel="Үндсэн баннер"
              autoplayMs={6500}
              slides={BIG_SLIDES.map((s) => (
                <Link
                  key={s.title}
                  href={s.href}
                  className="block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
                >
                  <img src={s.image} alt={s.subtitle} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
                  <div className="relative h-48 sm:h-56 md:h-72 text-white p-4 sm:p-6 md:p-8 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] sm:text-xs font-black tracking-widest text-red-300 uppercase">{s.title}</div>
                      <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-black leading-tight">{s.subtitle}</div>
                    </div>
                    <div className="text-4xl sm:text-5xl md:text-7xl opacity-25">{s.emoji}</div>
                  </div>
                </Link>
              ))}
            />
          </div>

          {/* Small carousel */}
          <Carousel
            ariaLabel="Онцлох баннер"
            autoplayMs={5500}
            slides={SMALL_SLIDES.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
              >
                <img src={s.image} alt={s.subtitle} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
                <div className="relative h-48 sm:h-56 lg:h-72 text-white p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-black tracking-widest text-red-300 uppercase">{s.title}</div>
                    <div className="mt-2 text-lg sm:text-xl font-black">{s.subtitle}</div>
                  </div>
                  <div className="text-6xl opacity-25 self-end">{s.emoji}</div>
                </div>
              </Link>
            ))}
          />
        </div>
      </div>

      {/* Grocery Category bento mosaic */}
      <GroceryBento />

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <SectionTitle
          title="Бүх шинэ бараа"
          right={
            <Link href="/s/laptop" className="text-sm font-bold text-primary hover:underline">
              Бүгдийг харах
            </Link>
          }
        />
        <ProductCarousel title="Бүх шинэ бараа" />
      </div>

      {/* Section blocks */}
      <div className="mt-10 space-y-10">
        {sectionPlan.map((s, i) => {
          if (s.kind === 'banner') {
            const img = SECTION_BANNERS[i] ?? 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1400&h=400&fit=crop';
            const emoji = SECTION_EMOJIS[i] ?? '🛒';
            return (
              <div key={`${s.kind}_${i}`}>
                <div className="max-w-7xl mx-auto px-4 mb-3">
                  <SectionTitle title={s.title} />
                </div>
                <ImageBanner title={s.title} subtitle={s.subtitle} href={s.href} fullWidth image={img} emoji={emoji} />
              </div>
            );
          }
          if (s.kind === 'products') {
            return (
              <div key={`${s.kind}_${i}`} className="max-w-7xl mx-auto px-4">
                <SectionTitle title={s.title} />
                <ProductCarousel title={s.title} />
              </div>
            );
          }
          if (s.kind === 'actions') {
            return (
              <div key={`${s.kind}_${i}`} className="max-w-7xl mx-auto px-4">
                <SectionTitle title="Үйлчилгээ" />
                <ServiceBento />
              </div>
            );
          }
          // banner1x2
          return (
            <div key={`${s.kind}_${i}`} className="max-w-7xl mx-auto px-4">
              <SectionTitle title="Онцлох" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ImageBanner title="Headphones" subtitle="Premium Audio" href="/" image={BANNER1X2_IMAGES[0]} emoji="🎧" />
                <ImageBanner title="Tech Lifestyle" subtitle="Smart Gadgets" href="/" image={BANNER1X2_IMAGES[1]} emoji="💡" />
                <ImageBanner title="Photography" subtitle="Cameras & Lenses" href="/" image={BANNER1X2_IMAGES[2]} emoji="📷" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Categories Section */}
      <section className="max-w-7xl mx-auto px-4 mt-12 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Ангилал</h2>
          <Link href="/categories" className="text-sm font-bold text-primary hover:underline">
            Бүгдийг харах →
          </Link>
        </div>

        {(() => {
          const gradients = [
            'from-blue-400 to-indigo-500',
            'from-violet-400 to-purple-600',
            'from-orange-400 to-orange-500',
            'from-rose-400 to-red-600',
            'from-emerald-400 to-teal-600',
            'from-sky-400 to-cyan-600',
            'from-amber-400 to-orange-500',
            'from-green-400 to-emerald-600',
            'from-pink-400 to-rose-500',
            'from-red-400 to-rose-600',
            'from-yellow-400 to-amber-500',
            'from-blue-300 to-cyan-500',
            'from-green-500 to-green-700',
            'from-amber-300 to-yellow-500',
            'from-purple-400 to-violet-600',
            'from-orange-300 to-red-400',
          ];
          const allItems = [
            ...(Object.keys(CATEGORY_LABELS) as CatalogCategoryKey[]).map((k, i) => ({
              key: k,
              href: `/${k}`,
              icon: CATEGORY_ICONS[k],
              label: CATEGORY_LABELS[k],
              gradient: gradients[i % gradients.length],
            })),
            { key: 'brands', href: '/brands', icon: '🏷️', label: 'Брэндүүд', gradient: 'from-gray-400 to-gray-600' },
          ];
          return (
            <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 gap-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 sm:gap-3">
              {allItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group flex flex-col items-center text-center shrink-0 w-[72px] sm:w-auto"
                >
                  <ElectroBorder
                    borderColor="#ffffff"
                    borderWidth={1.5}
                    distortion={0.7}
                    animationSpeed={0.5}
                    radius="1rem"
                    glowBlur={10}
                    aura={false}
                    className="w-14 h-14 sm:w-16 sm:h-16 mb-2 group-hover:scale-110 transition-transform duration-200"
                  >
                    <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl sm:text-3xl shadow-md`}>
                      {item.icon}
                    </div>
                  </ElectroBorder>
                  <div className="text-[10px] sm:text-xs font-bold text-gray-600 group-hover:text-primary transition-colors leading-tight">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          );
        })()}
      </section>
    </div>
  );
}
