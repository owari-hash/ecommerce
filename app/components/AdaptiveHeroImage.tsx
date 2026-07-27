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

  // Probe the source file's true intrinsic size directly (bypassing Next's responsive
  // `srcSet` negotiation). Reading naturalWidth/Height off the rendered `fill` image instead
  // would report whatever downscaled variant the browser picked for the current viewport/DPR
  // — e.g. a legitimately 3420px-wide source still resolves to a ~1920px variant on a normal
  // (non-Retina) desktop window, which would misclassify a perfectly high-res source as low-res.
  useEffect(() => {
    setNative(null)
    if (!src) return
    let cancelled = false
    const probe = new window.Image()
    probe.onload = () => {
      if (!cancelled && probe.naturalWidth && probe.naturalHeight) {
        setNative({ w: probe.naturalWidth, h: probe.naturalHeight })
      }
    }
    probe.src = src
    return () => { cancelled = true }
  }, [src])

  const isLowRes = !!native && (native.w < HD_MIN_WIDTH || native.h < HD_MIN_HEIGHT)

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
          className={`object-${fit} ${className}`}
        />
      )}
    </>
  )
}
