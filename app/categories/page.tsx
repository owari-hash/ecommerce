import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ангилал | Turbotech' };

const categories = [
  { label: 'Зөөврийн компьютер', href: '/s/laptop' },
  { label: 'Суурин компьютер', href: '/s/computer' },
  { label: 'Ухаалаг төхөөрөмж', href: '/s/smartphone-and-tablet' },
  { label: 'Консоль', href: '/s/console' },
  { label: 'Аудио төхөөрөмж', href: '/s/audio-equipment' },
  { label: 'Гэр ахуй', href: '/s/home' },
  { label: 'Дагалдах хэрэгсэл', href: '/s/accessories' },
  { label: 'Брэндүүд', href: '/brands' },
];

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">
          Нүүр
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Ангилал</span>
      </nav>

      <h1 className="text-2xl font-black text-gray-800 mb-6">Ангилал</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {categories.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="flex items-center justify-between px-5 py-4 hover:bg-blue-50 hover:text-[#1565C0] transition-colors"
              >
                <span className="font-medium text-sm">{c.label}</span>
                <span className="text-gray-300">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

