'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTenant } from './TenantContext';

const IP_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

function needsTenantParam(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || IP_RE.test(hostname);
}

/**
 * Returns a stable function that appends ?tenant=<slug> to internal hrefs
 * when on IP/localhost. On real domains it is a no-op.
 * Mount-gated so SSR and initial hydration render identical hrefs.
 */
export function useTenantHref() {
  const { slug } = useTenant();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useCallback(
    (href: string): string => {
      if (!mounted || !needsTenantParam() || !slug || slug === 'default') return href;
      const sep = href.includes('?') ? '&' : '?';
      return `${href}${sep}tenant=${encodeURIComponent(slug)}`;
    },
    [slug, mounted],
  );
}
