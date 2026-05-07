import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Салбар дэлгүүр | Turbotech' };

const stores = [
  {
    name: 'Turbotech — Их Наяд',
    address: 'Улаанбаатар хот, Хан-Уул дүүрэг, 15-р хороо, Их Наяд худалдааны төв, Зүүн өндөр 3 давхарт 309 тоот',
    phone: '7777-7734',
    hours: 'Өдөр бүр 10:00 - 20:00',
    district: 'Хан-Уул дүүрэг',
  },
  {
    name: 'Turbotech — Зүүн өндөр',
    address: 'Улаанбаатар хот, Хан-Уул дүүрэг, 15-р хороо, Зүүн өндөр худалдааны төв',
    phone: '7777-7754',
    hours: 'Өдөр бүр 10:00 - 20:00',
    district: 'Хан-Уул дүүрэг',
  },
];

export default function StoreLocationsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Салбар дэлгүүр</span>
      </nav>
      <h1 className="text-2xl font-black text-gray-800 mb-8">Салбар дэлгүүр</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {stores.map(store => (
          <div key={store.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1565C0] flex items-center justify-center flex-shrink-0 text-white text-xl">
                🏪
              </div>
              <div>
                <h2 className="font-bold text-gray-800 mb-1">{store.name}</h2>
                <p className="text-xs text-blue-600 font-medium mb-3">{store.district}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">📍</span>
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">📞</span>
                    <a href={`tel:${store.phone.replace(/-/g, '')}`} className="text-[#1565C0] hover:underline font-medium">{store.phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🕐</span>
                    <span>{store.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 h-64 flex flex-col items-center justify-center gap-3">
          <span className="text-6xl">🗺️</span>
          <p className="text-gray-500 font-medium">Улаанбаатар хот, Хан-Уул дүүрэг</p>
          <p className="text-sm text-gray-400">Их Наяд худалдааны төв</p>
        </div>
      </div>
    </div>
  );
}
