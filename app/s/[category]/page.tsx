import Link from 'next/link';
import type { Metadata } from 'next';

const categoryData: Record<string, { label: string; icon: string; products: typeof allProducts }> = {
  laptop: {
    label: 'Зөөврийн компьютер',
    icon: '💻',
    products: [
      { id: 1, name: 'MacBook Air M3 13"', brand: 'Apple', price: 3490000, oldPrice: 3790000, badge: 'Шинэ' },
      { id: 2, name: 'ASUS VivoBook 15 X1504', brand: 'ASUS', price: 1890000, oldPrice: null, badge: null },
      { id: 3, name: 'Dell Inspiron 15 3530', brand: 'DELL', price: 2190000, oldPrice: 2390000, badge: 'Хямдрал' },
      { id: 4, name: 'Lenovo IdeaPad 5i Gen 8', brand: 'LENOVO', price: 1990000, oldPrice: null, badge: null },
      { id: 5, name: 'HP Pavilion 14-dv2', brand: 'HP', price: 1650000, oldPrice: 1850000, badge: 'Хямдрал' },
      { id: 6, name: 'MSI Modern 14 C12M', brand: 'MSI', price: 2390000, oldPrice: null, badge: null },
      { id: 7, name: 'ASUS ROG Strix G16', brand: 'ASUS', price: 4290000, oldPrice: null, badge: 'Шинэ' },
      { id: 8, name: 'Acer Aspire 5 A515', brand: 'ACER', price: 1590000, oldPrice: 1790000, badge: 'Хямдрал' },
    ],
  },
  computer: {
    label: 'Суурин компьютер',
    icon: '🖥️',
    products: [
      { id: 1, name: 'iMac 24" M3 8-Core', brand: 'Apple', price: 4990000, oldPrice: null, badge: 'Шинэ' },
      { id: 2, name: 'Dell OptiPlex 7010 SFF', brand: 'DELL', price: 1890000, oldPrice: null, badge: null },
      { id: 3, name: 'HP EliteDesk 800 G9', brand: 'HP', price: 2290000, oldPrice: 2590000, badge: 'Хямдрал' },
      { id: 4, name: 'Lenovo ThinkCentre M70q', brand: 'LENOVO', price: 1490000, oldPrice: null, badge: null },
    ],
  },
  'smartphone-and-tablet': {
    label: 'Ухаалаг төхөөрөмж',
    icon: '📱',
    products: [
      { id: 1, name: 'iPhone 15 Pro 256GB', brand: 'Apple', price: 3890000, oldPrice: null, badge: 'Шинэ' },
      { id: 2, name: 'Samsung Galaxy S24 Ultra', brand: 'SAMSUNG', price: 2990000, oldPrice: null, badge: 'Шинэ' },
      { id: 3, name: 'Xiaomi 14 12/256GB', brand: 'XIAOMI', price: 1490000, oldPrice: 1690000, badge: 'Хямдрал' },
      { id: 4, name: 'Redmi Note 13 Pro 8/256GB', brand: 'Redmi', price: 890000, oldPrice: null, badge: null },
      { id: 5, name: 'Samsung Galaxy A55 5G', brand: 'SAMSUNG', price: 1190000, oldPrice: 1390000, badge: 'Хямдрал' },
      { id: 6, name: 'HUAWEI nova 12', brand: 'HUAWEI', price: 990000, oldPrice: null, badge: null },
    ],
  },
  console: {
    label: 'Консоль',
    icon: '🎮',
    products: [
      { id: 1, name: 'PlayStation 5 Slim', brand: 'SONY', price: 1990000, oldPrice: null, badge: 'Шинэ' },
      { id: 2, name: 'Xbox Series X', brand: 'MICROSOFT', price: 1890000, oldPrice: null, badge: null },
      { id: 3, name: 'Nintendo Switch OLED', brand: 'Nintendo', price: 1290000, oldPrice: 1490000, badge: 'Хямдрал' },
      { id: 4, name: 'PlayStation 5 DualSense', brand: 'SONY', price: 290000, oldPrice: null, badge: null },
    ],
  },
  'audio-equipment': {
    label: 'Аудио төхөөрөмж',
    icon: '🎧',
    products: [
      { id: 1, name: 'Sony WH-1000XM5', brand: 'SONY', price: 890000, oldPrice: 990000, badge: 'Хямдрал' },
      { id: 2, name: 'JBL Charge 5', brand: 'JBL', price: 390000, oldPrice: null, badge: null },
      { id: 3, name: 'Audio-Technica ATH-M50x', brand: 'Audio technica', price: 490000, oldPrice: null, badge: null },
      { id: 4, name: 'JBL Flip 6', brand: 'JBL', price: 290000, oldPrice: 340000, badge: 'Хямдрал' },
      { id: 5, name: 'Divoom Timebox Evo', brand: 'Divoom', price: 190000, oldPrice: null, badge: null },
    ],
  },
  home: {
    label: 'Гэр ахуй',
    icon: '🏠',
    products: [
      { id: 1, name: 'Midea AC 1.5HP Inverter', brand: 'Midea', price: 1290000, oldPrice: null, badge: null },
      { id: 2, name: 'Hansa Washing Machine 7kg', brand: 'Hansa', price: 890000, oldPrice: 990000, badge: 'Хямдрал' },
      { id: 3, name: 'Beko Refrigerator 300L', brand: 'Beko', price: 1490000, oldPrice: null, badge: null },
      { id: 4, name: 'dreame D10 Plus Robot', brand: 'dreame', price: 990000, oldPrice: 1190000, badge: 'Хямдрал' },
    ],
  },
  accessories: {
    label: 'Дагалдах хэрэгсэл',
    icon: '🖱️',
    products: [
      { id: 1, name: 'FANTECH ATOM65 Keyboard', brand: 'FANTECH', price: 90000, oldPrice: null, badge: null },
      { id: 2, name: 'FANTECH XD5 Mouse', brand: 'FANTECH', price: 45000, oldPrice: 55000, badge: 'Хямдрал' },
      { id: 3, name: 'Logitech MX Master 3S', brand: 'LOGITECH', price: 290000, oldPrice: null, badge: 'Шинэ' },
      { id: 4, name: 'REMAX USB-C Cable 1.2m', brand: 'REMAX', price: 15000, oldPrice: null, badge: null },
      { id: 5, name: 'WIWU Laptop Bag 15.6"', brand: 'WIWU', price: 89000, oldPrice: null, badge: null },
      { id: 6, name: 'BRATECK Monitor Stand', brand: 'BRATECK', price: 120000, oldPrice: 150000, badge: 'Хямдрал' },
      { id: 7, name: 'ASAYA USB Hub 7 Port', brand: 'ASAYA', price: 35000, oldPrice: null, badge: null },
      { id: 8, name: 'REMAX Power Bank 20000mAh', brand: 'REMAX', price: 79000, oldPrice: 99000, badge: 'Хямдрал' },
    ],
  },
};

const allProducts = [{ id: 0, name: '', brand: '', price: 0, oldPrice: null as number | null, badge: null as string | null }];

function formatPrice(n: number) {
  return '₮' + n.toLocaleString();
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const data = categoryData[category];
  return { title: `${data?.label ?? 'Бараа'} | Turbotech` };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = categoryData[category] ?? { label: 'Бараа', icon: '📦', products: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{data.label}</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">{data.icon}</span>
        <h1 className="text-2xl font-black text-gray-800">{data.label}</h1>
        <span className="text-sm text-gray-400">({data.products.length} бараа)</span>
      </div>

      {data.products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-7xl mb-4 opacity-40">📦</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Бараа байхгүй байна</h2>
          <p className="text-gray-400 mb-6 text-sm">Энэ ангилалд одоогоор бараа байхгүй байна</p>
          <Link href="/" className="inline-block bg-[#1565C0] text-white font-bold px-8 py-3 rounded-xl">Нүүр хуудас</Link>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3">Үнийн хязгаар</h3>
              <div className="space-y-2">
                {['100,000₮ хүртэл', '100,000 - 500,000₮', '500,000 - 1,000,000₮', '1,000,000₮-аас дээш'].map(r => (
                  <label key={r} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-[#1565C0]">
                    <input type="checkbox" className="rounded" /> {r}
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3">Брэнд</h3>
              <div className="space-y-2">
                {[...new Set(data.products.map(p => p.brand))].map(brand => (
                  <label key={brand} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-[#1565C0]">
                    <input type="checkbox" className="rounded" /> {brand}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between mb-5">
              <span className="text-sm text-gray-500">{data.products.length} бараа олдлоо</span>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#1565C0] bg-white text-gray-700">
                <option>Шинэ эхэлж</option>
                <option>Үнэ өсөхөөр</option>
                <option>Үнэ буурахаар</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.products.map(p => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group cursor-pointer">
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-44 flex items-center justify-center">
                    <span className="text-6xl opacity-60">{data.icon}</span>
                    {p.badge && (
                      <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white ${p.badge === 'Шинэ' ? 'bg-blue-600' : 'bg-red-500'}`}>
                        {p.badge}
                      </span>
                    )}
                    <button className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors text-lg">♡</button>
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{p.brand}</div>
                    <div className="text-sm font-medium text-gray-800 mb-2 leading-snug line-clamp-2">{p.name}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#1565C0] font-bold">{formatPrice(p.price)}</span>
                      {p.oldPrice && <span className="text-xs text-gray-400 line-through">{formatPrice(p.oldPrice)}</span>}
                    </div>
                    <button className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                      Сагсанд нэмэх
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
