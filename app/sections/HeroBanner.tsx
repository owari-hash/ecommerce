'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useTenant } from '../lib/TenantContext'
import HeroDetailModal from '../components/HeroDetailModal'

interface Slide {
  href: string
  title: string
  subtitle: string
  emoji: string
  image: string
  /** Up to 5 gallery images — shown one-by-one, full-bleed, in the click-to-open detail modal. */
  images?: string[]
}

interface HeroBannerProps {
  bigSlides?: Slide[]
  tenantId?: string
}

const DEFAULT_BIG: Slide[] = [
  {
    href: '/',
    title: 'Онцлох бүтээгдэхүүн',
    subtitle: 'Цахилгаан бараа',
    emoji: '🎮',
    image: 'https://unsplash.com/photos/a-video-game-console-sitting-on-top-of-a-wooden-table-uY6ZORCOCAM?w=2400&h=1400&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=1800&h=1800&fit=crop&q=90',
      'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=1800&h=1800&fit=crop&q=90',
      'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=1800&h=1800&fit=crop&q=90',
      'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=1800&h=1800&fit=crop&q=90',
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1800&h=1800&fit=crop&q=90',
    ],
  },
  {
    href: '/',
    title: 'Шинэ ирэлт',
    subtitle: 'Шинэ загварууд',
    emoji: '🛍️',
    image: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=2400&h=1400&fit=crop&q=90',
    images: [
      'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=2400&h=1500&fit=crop&q=90',
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=2400&h=1500&fit=crop&q=90',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=2400&h=1500&fit=crop&q=90',
    ],
  },
]

const TRUST_ITEMS = [
  { label: 'Үнэгүй хүргэлт', sub: 'Тодорхой дүнгээс дээш', icon: 'M5 8h9l3 4v5h-2M5 8V6a1 1 0 011-1h6a1 1 0 011 1v2M5 8v9h2m10 0a2 2 0 11-4 0 2 2 0 014 0zM7 17a2 2 0 11-4 0 2 2 0 014 0z' },
  { label: 'Баталгаат чанар', sub: 'Албан ёсны нийлүүлэгч', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { label: '7 хоногийн буцаалт', sub: 'Сэтгэл ханамж', icon: 'M4 4v5h5M20 20v-5h-5M5.5 9a7 7 0 0112.5-3M18.5 15a7 7 0 01-12.5 3' },
  { label: '24/7 тусламж', sub: 'Хэрэглэгчийн үйлчилгээ', icon: 'M18 10a8 8 0 10-16 0v4a2 2 0 002 2h1a1 1 0 001-1v-4a1 1 0 00-1-1H4m14 4v-4a1 1 0 011-1h1a1 1 0 011 1v4a2 2 0 01-2 2h-2a2 2 0 01-2 2v0' },
]

export default function HeroBanner({ bigSlides, tenantId }: HeroBannerProps) {
  const { branding } = useTenant()
  const resolvedBig = bigSlides && bigSlides.length > 0 ? bigSlides : DEFAULT_BIG

  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const len = resolvedBig.length
  const slide = resolvedBig[idx] ?? resolvedBig[0]

  useEffect(() => {
    if (paused || len <= 1 || modalOpen) return
    const t = window.setInterval(() => setIdx((i) => (i + 1) % len), 3000)
    return () => window.clearInterval(t)
  }, [paused, len, modalOpen])

  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const headlineY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <>
      <section
        ref={sectionRef}
        id="hero-banner"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative w-full h-[78vh] sm:h-[86vh] min-h-[540px] max-h-[880px] overflow-hidden bg-gray-950"
      >
        {/* Background photo — crossfade + slow Ken Burns zoom between slides */}
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          <AnimatePresence>
            <motion.div
              key={slide.image}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1.14 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1, ease: 'easeInOut' }, scale: { duration: 3.4, ease: 'linear' } }}
              className="absolute inset-0"
            >
              <Image src={slide.image} alt={slide.subtitle} fill priority quality={90} className="object-cover" sizes="100vw" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </motion.div>

        {/* Giant headline */}
        <motion.div
          style={{ y: headlineY, opacity: contentOpacity }}
          className="absolute inset-x-0 top-[24%] sm:top-[30%] z-10 flex justify-center px-4 pointer-events-none select-none"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={`h-${idx}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-white uppercase font-black text-center leading-[0.86] tracking-tight text-balance"
              style={{ fontSize: 'clamp(2.75rem, 11vw, 8.5rem)' }}
            >
              {slide.subtitle}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        {/* Clickable full-bleed hit area — opens the detail modal */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label={`${slide.subtitle} — дэлгэрэнгүй үзэх`}
          className="absolute inset-0 z-20 cursor-zoom-in"
        />

        {/* Bottom-left: copy + CTA */}
        <motion.div style={{ opacity: contentOpacity }} className="absolute left-4 sm:left-10 bottom-16 sm:bottom-14 z-30 max-w-[240px] sm:max-w-xs pointer-events-none">
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-4">
            {branding.description || 'Чанартай бараа, хурдан хүргэлт — өдөр бүр танд тохирсон сонголт.'}
          </p>
          <div className="flex items-center gap-2.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-colors"
            >
              Дэлгэрэнгүй үзэх
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="Дэлгэрэнгүй үзэх"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-gray-900 flex items-center justify-center shrink-0 hover:bg-gray-100 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
            </button>
          </div>
        </motion.div>

      </section>

      {/* Trust strip — quiet, minimal, always visible regardless of tenant config */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 rounded-2xl border border-gray-100 bg-white divide-x divide-y sm:divide-y-0 divide-gray-100 overflow-hidden">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 px-3.5 sm:px-4 py-3">
              <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={item.icon} />
              </svg>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight truncate">{item.label}</p>
                <p className="text-[10px] text-gray-400 leading-tight truncate hidden sm:block">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <HeroDetailModal
          slide={slide}
          tenantId={tenantId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
