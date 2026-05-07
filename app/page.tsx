import Link from 'next/link';

const products = [
  { id: 1, name: 'MacBook Air M3 13"', brand: 'Apple', price: 3490000, oldPrice: 3790000, category: 'laptop', badge: 'Шинэ' },
  { id: 2, name: 'ASUS VivoBook 15 X1504', brand: 'ASUS', price: 1890000, oldPrice: null, category: 'laptop', badge: null },
  { id: 3, name: 'Dell Inspiron 15 3530', brand: 'DELL', price: 2190000, oldPrice: 2390000, category: 'laptop', badge: 'Хямдрал' },
  { id: 4, name: 'Lenovo IdeaPad 5 15IAL7', brand: 'LENOVO', price: 1990000, oldPrice: null, category: 'laptop', badge: null },
  { id: 5, name: 'HP Pavilion 14-dv2', brand: 'HP', price: 1650000, oldPrice: 1850000, category: 'laptop', badge: 'Хямдрал' },
  { id: 6, name: 'Samsung Galaxy S24 Ultra', brand: 'SAMSUNG', price: 2990000, oldPrice: null, category: 'smartphone', badge: 'Шинэ' },
  { id: 7, name: 'iPhone 15 Pro 256GB', brand: 'Apple', price: 3890000, oldPrice: null, category: 'smartphone', badge: null },
  { id: 8, name: 'Xiaomi 14 12/256GB', brand: 'XIAOMI', price: 1490000, oldPrice: 1690000, category: 'smartphone', badge: 'Хямдрал' },
];

const brands = [
  'Apple', 'SAMSUNG', 'ASUS', 'DELL', 'LENOVO', 'HP', 'MSI', 'RAZER',
  'LOGITECH', 'SONY', 'FANTECH', 'REMAX',
];

const catIcons: Record<string, string> = {
  laptop: '💻',
  computer: '🖥️',
  smartphone: '📱',
  console: '🎮',
  audio: '🎧',
  home: '🏠',
  accessories: '🖱️',
};

function formatPrice(n: number) {
  return '₮' + n.toLocaleString('mn-MN');
}

function ProductCard({ p }: { p: typeof products[0] }) {
  const icon = catIcons[p.category] ?? '📦';
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group cursor-pointer">
      {/* Image placeholder */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-44 flex items-center justify-center">
        <span className="text-6xl opacity-60">{icon}</span>
        {p.badge && (
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white ${p.badge === 'Шинэ' ? 'bg-blue-600' : 'bg-red-500'}`}>
            {p.badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">{p.brand}</div>
        <div className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 leading-snug">{p.name}</div>
        <div className="flex items-center gap-2">
          <span className="text-[#1565C0] font-bold text-base">{formatPrice(p.price)}</span>
          {p.oldPrice && <span className="text-xs text-gray-400 line-through">{formatPrice(p.oldPrice)}</span>}
        </div>
        <button className="mt-3 w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-semibold py-2 rounded-lg transition-colors">
          Сагсанд нэмэх
        </button>
      </div>
    </div>
  );
}

const heroSlides = [
  { title: 'Хамгийн шинэ MacBook Air M3', sub: 'Хурдан. Хялбар. Гайхалтай.', cta: 'Одоо авах', href: '/s/laptop', from: '#0a1628', to: '#1565C0' },
  { title: 'Samsung Galaxy S24 Series', sub: 'AI камертай ухаалаг утас', cta: 'Дэлгэрэнгүй', href: '/s/smartphone-and-tablet', from: '#0a1628', to: '#1b5e20' },
  { title: 'FANTECH Gaming Gear', sub: 'Тоглоомын тоног төхөөрөмж', cta: 'Үзэх', href: '/s/accessories', from: '#1a0533', to: '#6a1b9a' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1565C0 100%)', minHeight: 320 }}>
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center gap-10">
          <div className="flex-1 text-white">
            <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-3">Онцгой санал</div>
            <h1 className="text-4xl font-black mb-3 leading-tight">MacBook Air M3<br /><span className="text-orange-400">13" & 15"</span></h1>
            <p className="text-blue-200 mb-6 text-lg">Хурдан. Хялбар. Гайхалтай. Apple Silicon шинэ үе.</p>
            <Link href="/s/laptop" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg">
              Одоо авах →
            </Link>
          </div>
          <div className="hidden md:flex text-[160px] opacity-20 select-none">💻</div>
        </div>
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-10 right-40 w-40 h-40 rounded-full bg-white opacity-5" />
      </div>

      {/* Category Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Бүтээгдэхүүний ангилал</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { icon: '💻', label: 'Зөөврийн компьютер', href: '/s/laptop' },
            { icon: '🖥️', label: 'Суурин компьютер', href: '/s/computer' },
            { icon: '📱', label: 'Ухаалаг төхөөрөмж', href: '/s/smartphone-and-tablet' },
            { icon: '🎮', label: 'Консоль', href: '/s/console' },
            { icon: '🎧', label: 'Аудио төхөөрөмж', href: '/s/audio-equipment' },
            { icon: '🏠', label: 'Гэр ахуй', href: '/s/home' },
            { icon: '🖱️', label: 'Дагалдах хэрэгсэл', href: '/s/accessories' },
          ].map(cat => (
            <Link key={cat.href} href={cat.href}
              className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 text-center shadow-sm hover:shadow-md hover:border-blue-300 border border-transparent transition-all group">
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Promo Banners */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', minHeight: 160 }}>
            <div className="p-6 text-white">
              <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Лизинг үйлчилгээ</div>
              <div className="text-2xl font-black mb-2">0% хүүтэй лизинг</div>
              <p className="text-blue-200 text-sm mb-4">Хамтрагч банкуудаар дамжуулан хялбар лизинг</p>
              <Link href="/leasing-all" className="inline-block bg-white text-blue-900 font-bold text-sm px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                Дэлгэрэнгүй →
              </Link>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-20">🏦</div>
          </div>
          <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #bf360c 0%, #e64a19 100%)', minHeight: 160 }}>
            <div className="p-6 text-white">
              <div className="text-xs font-semibold text-orange-200 uppercase tracking-widest mb-1">Хямдрал</div>
              <div className="text-2xl font-black mb-2">Sale бараанууд</div>
              <p className="text-orange-100 text-sm mb-4">Хямдарсан барааг үзэх</p>
              <Link href="/s/laptop" className="inline-block bg-white text-orange-900 font-bold text-sm px-5 py-2 rounded-lg hover:bg-orange-50 transition-colors">
                Үзэх →
              </Link>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-20">🏷️</div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Онцлох бараанууд</h2>
          <Link href="/s/laptop" className="text-sm text-[#1565C0] hover:underline font-medium">Бүгдийг харах →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>

      {/* Brands */}
      <div className="bg-white border-t border-b border-gray-100 py-10 mb-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">Брэндүүд</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {brands.map(b => (
              <Link key={b} href={`/brands`}
                className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl px-6 py-3 text-sm font-bold text-gray-700 hover:text-[#1565C0] transition-all">
                {b}
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/brands" className="inline-block text-sm text-[#1565C0] hover:underline font-medium">
              Бүх брэндийг харах →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
