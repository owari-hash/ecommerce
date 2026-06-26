'use client';

import Image from 'next/image';
import Link from 'next/link';
import Carousel from './Carousel';
import type { GroceryTile } from '../sections/GroceryBento';

function Card({ tile, className, style }: { tile: GroceryTile; className?: string; style?: React.CSSProperties }) {
  return (
    <Link
      href={tile.href}
      className={`group relative overflow-hidden rounded-xl bg-[#161b22] border border-white/5 block ${className ?? ''}`}
      style={style}
    >
      <Image
        src={tile.image}
        alt={tile.label}
        fill
        className="object-cover opacity-60 group-hover:opacity-75 transition-all duration-500"
        sizes="(max-width:640px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
      <div className="relative h-full p-3 flex flex-col justify-end">
        <p className="text-[9px] font-black uppercase tracking-[2px] text-primary mb-0.5">{tile.sub}</p>
        <h3 className="text-xs font-black uppercase tracking-wide text-white leading-tight">{tile.label}</h3>
        <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary">Дэлгэрэнгүй </span>
      </div>
    </Link>
  );
}

type Props = { tiles: GroceryTile[] };

export default function GroceryBentoMobile({ tiles }: Props) {
  // Guard: need at least 9 tiles
  if (tiles.length < 9) return null;

  // Hero slideshow (top): tiles 0, 1, 2
  const heroSlides = [0, 1, 2].map((idx) => (
    <Card key={idx} tile={tiles[idx]} style={{ height: 180 }} className="w-full" />
  ));

  // Small grid: 2 groups of 3
  // Group 1: tiles 3, 4, 5  |  Group 2: tiles 6, 7, 8
  const smallGroups = [
    [3, 4, 5],
    [6, 7, 8],
  ];

  const gridSlides = smallGroups.map((idxs, i) => (
    <div key={i} className="flex flex-col gap-2">
      <div className="flex gap-2" style={{ height: 110 }}>
        <Card tile={tiles[idxs[0]]} className="flex-1" />
        <Card tile={tiles[idxs[1]]} className="flex-1" />
      </div>
      <Card tile={tiles[idxs[2]]} style={{ height: 100 }} className="w-full" />
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
