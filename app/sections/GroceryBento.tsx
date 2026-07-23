import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import GroceryBentoMobile from '../components/GroceryBentoMobile'
import ImagePlaceholder from '../components/ImagePlaceholder'

export type GroceryTile = {
  label: string
  sub: string
  href: string
  image: string
}

const DEFAULT_TILES: GroceryTile[] = [
  { label: 'Шинэ жимс & ногоо', sub: 'Fresh Produce',       href: '/grocery/fresh-fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1400&h=900&fit=crop&q=90' },
  { label: 'Хүнсний дэлгүүр',   sub: 'Grocery Store',       href: '/grocery',              image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&h=1000&fit=crop&q=90' },
  { label: 'Сүүн бүтээгдэхүүн', sub: 'Dairy & Eggs',        href: '/grocery/dairy-eggs',   image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&h=1000&fit=crop&q=90' },
  { label: 'Махан бүтээгдэхүүн',       sub: 'Meat & Poultry',      href: '/grocery/meat-poultry', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=900&fit=crop&q=90' },
  { label: 'Далайн хүнс',       sub: 'Seafood',             href: '/grocery/seafood',      image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=1200&h=900&fit=crop&q=90' },
  { label: 'Органик ногоо',     sub: 'Organic Vegetables',  href: '/grocery/vegetables',   image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&h=1200&fit=crop&q=90' },
  { label: 'Бэйкери',           sub: 'Bread & Pastry',      href: '/grocery/bakery',       image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&h=900&fit=crop&q=90' },
  { label: 'Уух зүйлс',         sub: 'Beverages',           href: '/grocery/beverages',    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&h=900&fit=crop&q=90' },
  { label: 'Хөнгөн зууш',       sub: 'Snacks',              href: '/grocery/snacks',       image: 'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=1200&h=900&fit=crop&q=90' },
]

function BentoCard({ tile, className, style }: { tile: GroceryTile; className?: string; style?: React.CSSProperties }) {
  return (
    <Link
      href={tile.href}
      className={`group relative overflow-hidden rounded-2xl bg-[#161b22] border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/60 ${className ?? ''}`}
      style={style}
    >
      {tile.image ? (
        <Image
          src={tile.image}
          alt={tile.label}
          fill
          className="object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
          sizes="(max-width:768px) 100vw, 33vw"
        />
      ) : (
        <ImagePlaceholder />
      )}
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
  )
}

interface GroceryBentoProps {
  tiles?: GroceryTile[]
  sectionTitle?: string
}

export default function GroceryBento({ tiles, sectionTitle }: GroceryBentoProps) {
  // Use provided tiles when 9 are configured; otherwise fall back to defaults
  const t = tiles && tiles.length >= 9 ? tiles.slice(0, 9) : DEFAULT_TILES

  return (
    <section className="bg-[#0d1117] py-8 sm:py-10 mt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-6">
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-white tracking-wide min-w-0 truncate">
            {!(sectionTitle && sectionTitle.trim()) && <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" strokeWidth={2} />}
            <span className="truncate">{sectionTitle && sectionTitle.trim() ? sectionTitle : 'Хүнсний ангилал'}</span>
          </h2>
          <Link href={t[0]?.href ?? '/grocery'} className="shrink-0 text-sm font-bold text-primary hover:text-primary-light transition-colors">
            Бүгдийг харах
          </Link>
        </div>

        {/* Desktop: 2-column bento grid — positions 0-8 */}
        <div className="hidden md:flex gap-2.5">
          {/* Left column */}
          <div className="flex flex-col gap-2.5 flex-1">
            {/* [0] wide top */}
            <BentoCard tile={t[0]} style={{ height: 200 }} />
            {/* [1] + [2] side-by-side */}
            <div className="flex gap-2.5" style={{ height: 250 }}>
              <BentoCard tile={t[1]} className="flex-1" />
              <BentoCard tile={t[2]} className="flex-1" />
            </div>
            {/* [3] wide bottom */}
            <BentoCard tile={t[3]} style={{ height: 250 }} />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-2.5 flex-1">
            {/* [4] + [5] side-by-side */}
            <div className="flex gap-2.5" style={{ height: 280 }}>
              <BentoCard tile={t[4]} className="flex-1" />
              <BentoCard tile={t[5]} className="flex-1" />
            </div>
            {/* [6] wide middle */}
            <BentoCard tile={t[6]} style={{ height: 240 }} />
            {/* [7] + [8] side-by-side */}
            <div className="flex gap-2.5" style={{ height: 180 }}>
              <BentoCard tile={t[7]} className="flex-1" />
              <BentoCard tile={t[8]} className="flex-1" />
            </div>
          </div>
        </div>

        {/* Mobile carousel */}
        <GroceryBentoMobile tiles={t} />
      </div>
    </section>
  )
}
