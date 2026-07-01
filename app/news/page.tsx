import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Мэдээ' };

const news = [
  { id: 1, title: 'iPhone 15 Pro Max Монголд ирлээ', date: '2026-04-15', excerpt: 'Apple-ийн хамгийн шинэ iPhone 15 Pro Max Их Наяд Плаза дэлгүүрт ирлээ. Titanium бие, A17 Pro chip...', category: 'Шинэ бараа' },
  { id: 2, title: 'Samsung Galaxy S24 Ultra онцлог', date: '2026-04-10', excerpt: 'Galaxy S24 Ultra нь AI-р дэмжигдсэн камертай. Зурган дотор 200MP сенсор...', category: 'Шинэ бараа' },
  { id: 3, title: 'ASUS ROG тоглоомын зориулалтын лаптоп шинэчлэгдлээ', date: '2026-04-05', excerpt: 'ASUS ROG Strix G16 нь Intel Core i9-14900HX, NVIDIA RTX 4080...', category: 'Мэдээ' },
  { id: 4, title: 'Лизинг үйлчилгээ 0% хүүтэй болж өргөжлөө', date: '2026-03-28', excerpt: 'Их Наяд Плаза 5 банктай хамтран 0% хүүтэй лизинг үйлчилгээг санал болгож байна...', category: 'Мэдэгдэл' },
  { id: 5, title: 'FANTECH gaming gear шинэ загварууд', date: '2026-03-20', excerpt: 'FANTECH брэндийн хамгийн шинэ gaming mouse, keyboard, headset ирлээ...', category: 'Шинэ бараа' },
  { id: 6, title: 'Их Наяд Плаза Их Наяд салбар нээлтээ хийлээ', date: '2026-03-10', excerpt: 'Их Наяд худалдааны төвийн 3 давхарт Их Наяд Плаза шинэ салбар дэлгүүр нээлтээ хийлээ...', category: 'Мэдэгдэл' },
];

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Мэдээ</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Мэдээ</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 h-40 flex items-center justify-center text-6xl opacity-60 group-hover:opacity-80 transition-opacity">
              📰
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{item.category}</span>
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
              <h2 className="font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{item.title}</h2>
              <p className="text-sm text-gray-500 line-clamp-2">{item.excerpt}</p>
              <button className="mt-4 text-sm text-primary font-semibold hover:underline">Дэлгэрэнгүй </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
