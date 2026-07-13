'use client';

import Image from 'next/image';
import { useTenant } from '../lib/TenantContext';
import { resolveUploadUrl } from '../lib/apiClient';

/**
 * Neutral image placeholder for products/categories without an image.
 * Shows the tenant's logo faintly over a soft gradient so it looks
 * intentional and on-brand. Falls back to a subtle photo glyph when the
 * tenant has no logo. Fills its (relatively positioned) parent.
 */
export default function ImagePlaceholder({ className = '' }: { className?: string }) {
  const { branding } = useTenant();
  const logo = resolveUploadUrl(branding?.logo);

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 ${className}`}
      aria-hidden="true"
    >
      {logo ? (
        <Image
          src={logo}
          alt={branding?.name ?? ''}
          fill
          className="object-contain p-[18%] opacity-[0.14]"
          sizes="240px"
          unoptimized
        />
      ) : (
        <svg
          className="w-1/3 max-w-[64px] min-w-[28px] aspect-square text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
        >
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <circle cx="8.5" cy="9.5" r="1.6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l4.5-4.5a2 2 0 012.8 0L16 17m-1.5-2l1.7-1.7a2 2 0 012.8 0L21 15" />
        </svg>
      )}
    </div>
  );
}
