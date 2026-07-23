'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ClipboardList, Truck, Phone, Wrench, Monitor, Lock, type LucideIcon } from 'lucide-react';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

const SERVICES: { href: string; label: string; sub: string; Icon: LucideIcon; image: string }[] = [
  {
    href: '/leasing-form',
    label: 'Лизинг хүсэлт',
    sub: 'Хурдан, хялбар лизинг',
    Icon: ClipboardList,
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop',
  },
  {
    href: '/delivery',
    label: 'Хүргэлт',
    sub: 'Хаана ч хүргэнэ',
    Icon: Truck,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop',
  },
  {
    href: '/contact',
    label: 'Холбоо барих',
    sub: 'Бидэнтэй холбогдох',
    Icon: Phone,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
  },
  {
    href: '/warranty',
    label: 'Засвар & Баталгаа',
    sub: 'Албан ёсны засварын үйлчилгээ',
    Icon: Wrench,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
  },
  {
    href: '/installation',
    label: 'Суурилуулалт',
    sub: 'Мэргэжлийн тохиргоо',
    Icon: Monitor,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop',
  },
  {
    href: '/payment',
    label: 'Аюулгүй төлбөр',
    sub: 'Олон төрлийн төлбөрийн хэрэгсэл',
    Icon: Lock,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop',
  },
];

// 3 columns × 2 rows
const COLS = 3;
const ROWS = 2;

function ServiceCard({ svc }: { svc: typeof SERVICES[number] }) {
  return (
    <Link
      href={svc.href}
      className="relative overflow-hidden rounded-2xl aspect-[4/3] group block"
    >
      <Image
        src={svc.image}
        alt={svc.label}
        fill
        className="object-cover group-active:scale-105 transition-transform duration-300"
        sizes="(max-width:768px) 50vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/5" />
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow">
          <svc.Icon className="w-4 h-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-white/60 text-[9px] font-black tracking-widest uppercase mb-0.5">Үйлчилгээ</p>
          <h3 className="text-white font-black text-xs leading-tight">{svc.label}</h3>
        </div>
      </div>
    </Link>
  );
}

export default function ServiceBento() {
  const [activeRow, setActiveRow] = useState(0);
  const [activeCol, setActiveCol] = useState(1);

  const gridTemplateRows = Array.from({ length: ROWS }, (_, r) =>
    activeRow === r ? '3fr' : '1fr'
  ).join(' ');

  const gridTemplateColumns = Array.from({ length: COLS }, (_, c) =>
    activeCol === c ? '3fr' : '1fr'
  ).join(' ');

  return (
    <>
      {/* Mobile: simple 2-col grid */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {SERVICES.map((svc) => <ServiceCard key={svc.href} svc={svc} />)}
      </div>

      {/* Desktop: animated bento */}
      <motion.div
        className="hidden md:grid gap-3 w-full"
        style={{ aspectRatio: '16/7' }}
        animate={{ gridTemplateRows, gridTemplateColumns }}
        onMouseLeave={() => { setActiveRow(0); setActiveCol(1); }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
      >
        {SERVICES.map((svc, i) => {
          const row = Math.floor(i / COLS);
          const col = i % COLS;
          const isActive = activeRow === row && activeCol === col;

          return (
            <Link
              key={svc.href}
              href={svc.href}
              className={cn(
                'relative overflow-hidden rounded-2xl cursor-pointer group border border-white/10 shadow-lg transition-shadow duration-300',
                isActive ? 'z-20 shadow-2xl' : 'z-0'
              )}
              onMouseEnter={() => { setActiveRow(row); setActiveCol(col); }}
            >
              <Image
                src={svc.image}
                alt={svc.label}
                fill
                className={cn(
                  'object-cover transition-all duration-700',
                  isActive ? 'scale-105' : 'scale-100 grayscale-[0.4]',
                  'group-hover:scale-110 group-hover:grayscale-0'
                )}
                sizes="(max-width:768px) 50vw, 25vw"
              />
              <div className={cn(
                'absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-opacity duration-500',
                isActive ? 'opacity-70' : 'opacity-90'
              )} />
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow">
                  <svc.Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                </div>
                <div className={cn(
                  'transition-all duration-300',
                  isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'
                )}>
                  <p className="text-white/70 text-[10px] font-black tracking-[0.15em] uppercase mb-0.5">Үйлчилгээ</p>
                  <h3 className="text-white font-black text-sm sm:text-base leading-tight">{svc.label}</h3>
                  <p className={cn(
                    'text-white/75 text-xs mt-0.5 transition-all duration-300',
                    isActive ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'
                  )}>
                    {svc.sub}
                  </p>
                </div>
              </div>
              {isActive && (
                <motion.div
                  layoutId="svc-glow"
                  className="absolute inset-0 ring-2 ring-white/30 rounded-2xl pointer-events-none"
                />
              )}
            </Link>
          );
        })}
      </motion.div>
    </>
  );
}
