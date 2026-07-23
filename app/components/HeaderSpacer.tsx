'use client';

import { usePathname } from 'next/navigation';

/**
 * Offsets content below the fixed header — except on the homepage, where the
 * header renders transparent and overlays the full-bleed hero instead.
 */
export default function HeaderSpacer() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return <div className="h-[90px] sm:h-[132px] shrink-0" aria-hidden="true" />;
}
