import Image from 'next/image'
import Link from 'next/link'
import Carousel from '../components/Carousel'

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
    href: '/',
    title: 'Шинэ ирэлт',
    subtitle: 'Шилдэг бараанууд',
    emoji: '🛍️',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=600&fit=crop',
  },
  {
    href: '/',
    title: 'Онцлох санал',
    subtitle: 'Хямдрал & Урамшуулал',
    emoji: '🎁',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&h=600&fit=crop',
  },
  {
    href: '/',
    title: 'Шинэ бүтээгдэхүүн',
    subtitle: 'Хамгийн шинэ загварууд',
    emoji: '✨',
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

export default function HeroBanner({ bigSlides, smallSlides }: HeroBannerProps) {
  const resolvedBig   = bigSlides   && bigSlides.length   > 0 ? bigSlides   : DEFAULT_BIG
  const resolvedSmall = smallSlides && smallSlides.length > 0 ? smallSlides : DEFAULT_SMALL
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Main carousel — 2/3 width on desktop */}
        <div className="lg:col-span-2">
          <Carousel
            ariaLabel="Үндсэн баннер"
            autoplayMs={6500}
            slides={resolvedBig.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="block rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative"
              >
                <Image src={s.image} alt={s.subtitle} fill className="object-cover scale-100 hover:scale-[1.02] transition-transform duration-700" sizes="(max-width:1024px) 100vw, 66vw" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="relative h-44 sm:h-56 md:h-72 text-white p-4 sm:p-6 md:p-10 flex flex-col justify-end gap-3">
                  <div>
                    <span className="inline-block text-[10px] sm:text-[11px] font-black tracking-[3px] text-red-300 uppercase bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2">{s.title}</span>
                    <div className="text-xl sm:text-2xl md:text-4xl font-black leading-tight drop-shadow-md">{s.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs font-black px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
                      Дэлгэрэнгүй харах
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          />
        </div>

        {/* Side carousel — 1/3 width on desktop, hidden on mobile (hero is enough) */}
        <div className="hidden lg:block">
          <Carousel
            ariaLabel="Онцлох баннер"
            autoplayMs={5500}
            slides={resolvedSmall.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="block rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative"
              >
                <Image src={s.image} alt={s.subtitle} fill className="object-cover" sizes="33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative h-72 text-white p-5 flex flex-col justify-end">
                  <span className="text-[10px] font-black tracking-[3px] text-red-300 uppercase mb-1">{s.title}</span>
                  <div className="text-lg font-black leading-snug">{s.subtitle}</div>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-primary-light">
                    Харах
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                  </span>
                </div>
              </Link>
            ))}
          />
        </div>
      </div>
    </div>
  )
}
