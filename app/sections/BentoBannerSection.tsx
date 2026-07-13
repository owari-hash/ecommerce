'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useTenantHref } from '../lib/useTenantHref'

interface BentoBannerSectionProps {
  image?: string
  link?: string
}

export default function BentoBannerSection({ image, link }: BentoBannerSectionProps) {
  const tenantHref = useTenantHref()
  if (!image) return null

  const content = (
    <div className="relative w-full h-[180px] sm:h-[260px] md:h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <Image
        src={image}
        alt="Promo Banner"
        fill
        className="object-cover hover:scale-[1.01] transition-transform duration-500"
        sizes="(max-width: 1280px) 100vw, 1280px"
        priority
      />
    </div>
  )

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 mt-6 sm:mt-10">
      {link ? (
        <Link href={tenantHref(link)} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  )
}
