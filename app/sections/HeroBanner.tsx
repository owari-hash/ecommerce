import Link from 'next/link'
import Carousel from '../components/Carousel'
import { MOCK_PRODUCTS } from '../lib/mockCatalog'

interface Slide {
  href: string
  title: string
  subtitle: string
  emoji: string
  image: string
}

interface HeroBannerProps {
  bigSlides?: Slide[]
  smallSlides?: Slide[]
}

const DEFAULT_BIG: Slide[] = [
  {
    href: `/product/${MOCK_PRODUCTS[0]?.slug ?? ''}`,
    title: 'Шинэ ирэлт',
    subtitle: 'Acer Predator Helios Neo 16',
    emoji: '💻',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=600&fit=crop',
  },
  {
    href: '/computer',
    title: 'Суурин компьютер',
    subtitle: 'Desktop & Parts',
    emoji: '🖥️',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&h=600&fit=crop',
  },
  {
    href: `/product/${MOCK_PRODUCTS[2]?.slug ?? ''}`,
    title: 'Gaming Graphics',
    subtitle: 'ASUS TUF Gaming RTX 4090',
    emoji: '🧩',
    image: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=1200&h=600&fit=crop',
  },
]

const DEFAULT_SMALL: Slide[] = [
  {
    href: '/',
    title: 'Онцлох бараа',
    subtitle: 'iPhone 17 Pro',
    emoji: '📱',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=700&fit=crop',
  },
  {
    href: '/brands/apple',
    title: 'Apple',
    subtitle: 'Apple Ecosystem',
    emoji: '🍎',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=700&fit=crop',
  },
  {
    href: '/smartphone-and-tablet',
    title: 'Ухаалаг төхөөрөмж',
    subtitle: 'iPhone / iPad',
    emoji: '📱',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=700&fit=crop',
  },
]

export default function HeroBanner({ bigSlides = DEFAULT_BIG, smallSlides = DEFAULT_SMALL }: HeroBannerProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Carousel
            ariaLabel="Үндсэн баннер"
            autoplayMs={6500}
            slides={bigSlides.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
              >
                <img src={s.image} alt={s.subtitle} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
                <div className="relative h-48 sm:h-56 md:h-72 text-white p-4 sm:p-6 md:p-8 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] sm:text-xs font-black tracking-widest text-red-300 uppercase">{s.title}</div>
                    <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-black leading-tight">{s.subtitle}</div>
                  </div>
                  <div className="text-4xl sm:text-5xl md:text-7xl opacity-25">{s.emoji}</div>
                </div>
              </Link>
            ))}
          />
        </div>
        <Carousel
          ariaLabel="Онцлох баннер"
          autoplayMs={5500}
          slides={smallSlides.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
            >
              <img src={s.image} alt={s.subtitle} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
              <div className="relative h-48 sm:h-56 lg:h-72 text-white p-5 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-black tracking-widest text-red-300 uppercase">{s.title}</div>
                  <div className="mt-2 text-lg sm:text-xl font-black">{s.subtitle}</div>
                </div>
                <div className="text-6xl opacity-25 self-end">{s.emoji}</div>
              </div>
            </Link>
          ))}
        />
      </div>
    </div>
  )
}
