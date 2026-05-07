import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Брэндүүд | Turbotech' };

const brands = [
  { name: 'Apple', slug: 'apple' },
  { name: 'SAMSUNG', slug: 'samsung' },
  { name: 'ASUS', slug: 'asus' },
  { name: 'DELL', slug: 'dell' },
  { name: 'LENOVO', slug: 'lenovo' },
  { name: 'HP', slug: 'hp' },
  { name: 'MSI', slug: 'msi' },
  { name: 'ACER', slug: 'acer' },
  { name: 'MICROSOFT', slug: 'microsoft' },
  { name: 'ALIENWARE', slug: 'alienware' },
  { name: 'RAZER', slug: 'razer' },
  { name: 'LOGITECH', slug: 'logitech' },
  { name: 'SONY', slug: 'sony' },
  { name: 'FANTECH', slug: 'fantech' },
  { name: 'REMAX', slug: 'remax' },
  { name: 'XIAOMI', slug: 'xiaomi_' },
  { name: 'Xiao Mi', slug: 'xiaomi' },
  { name: 'Redmi', slug: '22' },
  { name: 'HUAWEI', slug: 'huawei' },
  { name: 'LG', slug: 'lg' },
  { name: 'JBL', slug: 'jbl' },
  { name: 'AOC', slug: 'aoc' },
  { name: 'EPSON', slug: 'epson' },
  { name: 'INTEL', slug: 'intel' },
  { name: 'CoolerMaster', slug: 'coolermaster' },
  { name: 'THERMALTAKE', slug: 'thermaltake' },
  { name: 'PHANTEKS', slug: '324' },
  { name: 'ASRock', slug: '1235689' },
  { name: 'G.SKILL', slug: 'gskill' },
  { name: 'T-force', slug: 't-force' },
  { name: 'LEXAR', slug: 'lexar' },
  { name: 'Apacer', slug: '3900' },
  { name: 'Sandisk', slug: 'sandisk' },
  { name: 'WIWU', slug: 'wiwu' },
  { name: 'BRATECK', slug: 'brateck' },
  { name: 'UAG', slug: '114281' },
  { name: 'hoco', slug: 'hoco' },
  { name: 'ASAYA', slug: 'asaya' },
  { name: 'REMAX', slug: 'remax' },
  { name: 'HiFuture', slug: 'hi-future' },
  { name: 'Divoom', slug: 'divoom' },
  { name: 'Audio technica', slug: '123456788' },
  { name: 'Valkyrie', slug: 'valkyrie' },
  { name: 'Mecool', slug: 'mecool' },
  { name: 'dreame', slug: 'dreame' },
  { name: 'Cluvens', slug: '123456789010' },
  { name: 'Hansa', slug: 'hansa' },
  { name: 'Midea', slug: 'midea' },
  { name: 'Beko', slug: 'beko' },
  { name: 'Rotenzo', slug: 'rotenzo' },
  { name: 'Team', slug: 'team' },
  { name: 'North Bayou', slug: 'nb' },
  { name: 'Nubia', slug: 'nubia' },
  { name: 'Honcam', slug: 'honcam' },
  { name: 'No Brand', slug: 'nobrand' },
];

export default function BrandsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1565C0]">Нүүр</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Брэндүүд</span>
      </nav>

      <h1 className="text-2xl font-black text-gray-800 mb-8">Брэндүүд</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map((brand, i) => (
          <Link
            key={`${brand.slug}-${i}`}
            href={`/brands/${brand.slug}`}
            className="bg-white rounded-xl border border-gray-200 hover:border-[#1565C0] hover:shadow-md transition-all p-5 flex flex-col items-center justify-center gap-3 group min-h-[100px]"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-xl font-black text-[#1565C0] group-hover:scale-110 transition-transform">
              {brand.name.charAt(0)}
            </div>
            <span className="text-xs font-bold text-gray-700 text-center group-hover:text-[#1565C0] transition-colors leading-tight">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
