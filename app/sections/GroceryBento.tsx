import Link from 'next/link'
import GroceryBentoMobile from '../components/GroceryBentoMobile'

const GROCERY_TILES = [
  { id: 'fresh', label: 'Шинэ жимс & ногоо', sub: 'Fresh Produce', href: '/grocery/fresh-fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&h=420&fit=crop' },
  { id: 'store', label: 'Хүнсний дэлгүүр', sub: 'Grocery Store', href: '/grocery', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&h=420&fit=crop' },
  { id: 'dairy', label: 'Сүүн бүтээгдэхүүн', sub: 'Dairy & Eggs', href: '/grocery/dairy-eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=420&fit=crop' },
  { id: 'meat', label: 'Мах & Шувуу', sub: 'Meat & Poultry', href: '/grocery/meat-poultry', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&h=380&fit=crop' },
  { id: 'seafood', label: 'Далайн хүнс', sub: 'Seafood', href: '/grocery/seafood', image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500&h=380&fit=crop' },
  { id: 'veg', label: 'Органик ногоо', sub: 'Organic Vegetables', href: '/grocery/vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&h=600&fit=crop' },
  { id: 'bakery', label: 'Бэйкери', sub: 'Bread & Pastry', href: '/grocery/bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&h=420&fit=crop' },
  { id: 'drinks', label: 'Уух зүйлс', sub: 'Beverages', href: '/grocery/beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=380&fit=crop' },
  { id: 'snacks', label: 'Хөнгөн зууш', sub: 'Snacks', href: '/grocery/snacks', image: 'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=500&h=380&fit=crop' },
]

type Tile = typeof GROCERY_TILES[0]

function BentoCard({ tile, className, style }: { tile: Tile; className?: string; style?: React.CSSProperties }) {
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
  )
}

export default function GroceryBento() {
  const byId = Object.fromEntries(GROCERY_TILES.map((t) => [t.id, t]))

  return (
    <section className="bg-[#0d1117] py-8 sm:py-10 mt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">🛒 Хүнсний ангилал</h2>
          <Link href="/grocery" className="text-sm font-bold text-primary hover:text-primary-light transition-colors">
            Бүгдийг харах →
          </Link>
        </div>

        <div className="hidden md:flex gap-2.5">
          <div className="flex flex-col gap-2.5 flex-1">
            <BentoCard tile={byId.fresh} style={{ height: 200 }} />
            <div className="flex gap-2.5" style={{ height: 250 }}>
              <BentoCard tile={byId.meat} className="flex-1" />
              <BentoCard tile={byId.seafood} className="flex-1" />
            </div>
            <BentoCard tile={byId.bakery} style={{ height: 250 }} />
          </div>
          <div className="flex flex-col gap-2.5 flex-1">
            <div className="flex gap-2.5" style={{ height: 280 }}>
              <BentoCard tile={byId.dairy} className="flex-1" />
              <BentoCard tile={byId.veg} className="flex-1" />
            </div>
            <BentoCard tile={byId.store} style={{ height: 240 }} />
            <div className="flex gap-2.5" style={{ height: 180 }}>
              <BentoCard tile={byId.drinks} className="flex-1" />
              <BentoCard tile={byId.snacks} className="flex-1" />
            </div>
          </div>
        </div>

        <GroceryBentoMobile tiles={GROCERY_TILES} />
      </div>
    </section>
  )
}
