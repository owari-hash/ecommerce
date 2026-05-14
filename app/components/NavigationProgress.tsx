'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  // Route finished — complete the bar then hide
  useEffect(() => {
    if (!startedRef.current) return;
    startedRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    const t = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 350);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor?.href) return;
      // Skip external, hash-only, or same-page links
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.hash) return;
      } catch { return; }

      if (intervalRef.current) clearInterval(intervalRef.current);
      startedRef.current = true;
      setVisible(true);
      setProgress(12);

      let p = 12;
      intervalRef.current = setInterval(() => {
        p += (90 - p) * 0.12;
        setProgress(Math.min(p, 90));
      }, 120);
    };

    document.addEventListener('click', onLinkClick);
    return () => {
      document.removeEventListener('click', onLinkClick);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nav-bar"
          className="fixed top-0 inset-x-0 z-[9999] h-[3px] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
        >
          {/* Progress fill */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-red-400 to-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
          {/* Leading glow */}
          <motion.div
            className="absolute top-0 h-full w-20 -translate-x-1/2"
            style={{ background: 'radial-gradient(ellipse at center, rgba(211,47,47,0.7) 0%, transparent 70%)' }}
            animate={{ left: `${progress}%` }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
