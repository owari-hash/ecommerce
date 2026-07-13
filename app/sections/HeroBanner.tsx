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
                    <span className="inline-block text-[10px] sm:text-[11px] font-black tracking-[3px] text-primary-light uppercase bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2">{s.title}</span>
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
                  <span className="text-[10px] font-black tracking-[3px] text-primary-light uppercase mb-1">{s.title}</span>
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

     
      <div className="mt-3 sm:mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {[
          { title: 'Шуурхай хүргэлт', sub: '24-48 цагт', d: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM20 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4l3 4v3a1 1 0 01-1 1h-1m-4 0H9' },
          { title: 'Найдвартай төлбөр', sub: 'QPay & банк', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { title: 'И-Баримт', sub: 'Автомат олгоно', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { title: 'Тусламж дэмжлэг', sub: 'Ажлын өдрүүдэд', d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8 15h8M9 9h.01M15 9h.01' },
        ].map((f) => (
          <div key={f.title} className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2.5">
            <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.d} /></svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-bold text-gray-800 truncate">{f.title}</p>
              <p className="text-[10px] text-gray-400 truncate">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
