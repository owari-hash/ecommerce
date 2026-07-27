'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface AdaptiveHeroImageProps {
  src: string
  alt: string
  priority?: boolean
  quality?: number
  /** How the image behaves once confirmed to be at (or above) full-bleed display resolution. */
  fit?: 'cover' | 'contain'
  /** Fill any letterboxing left by an under-resolution source with a blurred copy of the same
   *  image, instead of leaving the plain background behind it exposed. */
  blurredBackdrop?: boolean
  className?: string
}

// Below this, a `fill` image would be stretched past its native pixels on a full-bleed
// banner and read as visibly soft/blurry. Once detected, we stop upscaling it and instead
// render it at its true resolution, centered, so it stays crisp no matter the source size.
// The banner renders edge-to-edge across the viewport (up to ~1920px CSS-wide), and on
// any 2x/Retina display the browser needs ~2x that many *physical* pixels to stay crisp —
// so the floor has to sit well above 1080p, not just above it.
const HD_MIN_WIDTH = 2560
const HD_MIN_HEIGHT = 1440

export default function AdaptiveHeroImage({
  src,
  alt,
  priority,
  quality = 90,
  fit = 'cover',
  blurredBackdrop = false,
  className = '',
}: AdaptiveHeroImageProps) {
  const [native, setNative] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    setNative(null)
  }, [src])

  const isLowRes = !!native && (native.w < HD_MIN_WIDTH || native.h < HD_MIN_HEIGHT)

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    if (img.naturalWidth && img.naturalHeight) {
      setNative({ w: img.naturalWidth, h: img.naturalHeight })
    }
  }

  return (
    <>
      {blurredBackdrop && isLowRes && (
        <Image
          src={src}
          alt=""
          aria-hidden
          fill
          quality={quality}
          sizes="100vw"
          className="object-cover scale-125 blur-2xl brightness-75 saturate-150"
        />
      )}
      {isLowRes && native ? (
        <Image
          src={src}
          alt={alt}
          width={native.w}
          height={native.h}
          priority={priority}
          quality={quality}
          sizes={`${native.w}px`}
          onLoad={handleLoad}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain ${className}`}
          style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          sizes="100vw"
          onLoad={handleLoad}
          className={`object-${fit} ${className}`}
        />
      )}
    </>
  )
}
