'use client';

import Link from 'next/link';
import Carousel from './Carousel';

type Tile = {
  id: string;
  label: string;
  sub: string;
  href: string;
  image: string;
};

function Card({ tile, className, style }: { tile: Tile; className?: string; style?: React.CSSProperties }) {
  return (
    <Link
      href={tile.href}
      className={`group relative overflow-hidden rounded-xl bg-[#161b22] border border-white/5 block ${className ?? ''}`}
      style={style}
    >
      <img
        src={tile.image}
        alt={tile.label}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-all duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
      <div className="relative h-full p-3 flex flex-col justify-end">
        <p className="text-[9px] font-black uppercase tracking-[2px] text-primary mb-0.5">{tile.sub}</p>
        <h3 className="text-xs font-black uppercase tracking-wide text-white leading-tight">{tile.label}</h3>
        <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary">Дэлгэрэнгүй →</span>
      </div>
    </Link>
  );
}

type Props = { tiles: Tile[] };

export default function GroceryBentoMobile({ tiles }: Props) {
  const byId = Object.fromEntries(tiles.map(t => [t.id, t]));

  // ── Hero slideshow (top): fresh → bakery → store ──────────────────────────
  const heroSlides = ['fresh', 'bakery', 'store'].map(id => (
    <Card key={id} tile={byId[id]} style={{ height: 180 }} className="w-full" />
  ));

  // ── Small grid slideshow (bottom): 2 slides × 3 tiles each ───────────────
  // Slide layout: 2 side-by-side on top + 1 full-width below
  const smallGroups = [
    ['dairy', 'veg', 'meat'],
    ['seafood', 'drinks', 'snacks'],
  ];

  const gridSlides = smallGroups.map((ids, i) => (
    <div key={i} className="flex flex-col gap-2">
      <div className="flex gap-2" style={{ height: 110 }}>
        <Card tile={byId[ids[0]]} className="flex-1" />
        <Card tile={byId[ids[1]]} className="flex-1" />
      </div>
      <Card tile={byId[ids[2]]} style={{ height: 100 }} className="w-full" />
    </div>
  ));

  return (
    <div className="flex flex-col gap-4 md:hidden">
      {/* Hero slideshow */}
      <Carousel
        slides={heroSlides}
        ariaLabel="Онцлох ангилал"
        autoplayMs={4000}
        showDots
        showArrows={false}
        viewportClassName="rounded-xl overflow-hidden"
      />

      {/* Small grid slideshow */}
      <Carousel
        slides={gridSlides}
        ariaLabel="Бусад ангилал"
        autoplayMs={0}
        showDots
        showArrows={false}
        viewportClassName="rounded-xl overflow-hidden"
      />
    </div>
  );
}
