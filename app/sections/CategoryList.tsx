import Link from 'next/link'
import { CATEGORY_ICONS, CATEGORY_LABELS, type CatalogCategoryKey } from '../lib/mockCatalog'

interface CategoryListProps {
  showBrands?: boolean
}

export default function CategoryList({ showBrands = true }: CategoryListProps) {
  const items = [
    ...(Object.keys(CATEGORY_LABELS) as CatalogCategoryKey[]).map((k) => ({
      key: k,
      href: `/${k}`,
      icon: CATEGORY_ICONS[k],
      label: CATEGORY_LABELS[k],
    })),
    ...(showBrands ? [{ key: 'brands', href: '/brands', icon: '🏷️', label: 'Брэндүүд' }] : []),
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Ангилал</h2>
        <Link href="/categories" className="text-sm font-bold text-primary hover:underline">
          Бүгдийг харах →
        </Link>
      </div>
      <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 gap-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 sm:gap-4">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="group flex flex-col items-center text-center shrink-0 w-[72px] sm:w-auto gap-2"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-gray-200 group-hover:border-primary flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-all duration-200">
              {item.icon}
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-600 group-hover:text-primary transition-colors leading-tight">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
