'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  slides: React.ReactNode[];
  className?: string;
  viewportClassName?: string;
  slideClassName?: string;
  autoplayMs?: number;
  showDots?: boolean;
  showArrows?: boolean;
  ariaLabel?: string;
};

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  const m = i % len;
  return m < 0 ? m + len : m;
}

export default function Carousel({
  slides,
  className,
  viewportClassName,
  slideClassName,
  autoplayMs,
  showDots = true,
  showArrows = true,
  ariaLabel = 'carousel',
}: Props) {
  const len = slides.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ startX: number; lastX: number; active: boolean }>({
    startX: 0,
    lastX: 0,
    active: false,
  });

  const safeIdx = useMemo(() => clampIndex(idx, len), [idx, len]);

  useEffect(() => {
    if (!autoplayMs || autoplayMs < 1000) return;
    if (paused) return;
    if (len <= 1) return;

    const t = window.setInterval(() => setIdx((x) => x + 1), autoplayMs);
    return () => window.clearInterval(t);
  }, [autoplayMs, paused, len]);

  if (len === 0) return null;

  const go = (next: number) => setIdx(clampIndex(next, len));

  return (
    <section
      aria-label={ariaLabel}
      className={className}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`relative overflow-hidden ${viewportClassName ?? ''}`}>
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${safeIdx * 100}%)` }}
          onPointerDown={(e) => {
            drag.current = { startX: e.clientX, lastX: e.clientX, active: true };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            setPaused(true);
          }}
          onPointerMove={(e) => {
            if (!drag.current.active) return;
            drag.current.lastX = e.clientX;
          }}
          onPointerUp={(e) => {
            if (!drag.current.active) return;
            const dx = drag.current.lastX - drag.current.startX;
            drag.current.active = false;
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            setPaused(false);
            if (Math.abs(dx) < 40) return;
            if (dx < 0) go(safeIdx + 1);
            else go(safeIdx - 1);
          }}
        >
          {slides.map((node, i) => (
            <div
              key={i}
              className={`min-w-full ${slideClassName ?? ''}`}
              aria-hidden={i !== safeIdx}
            >
              {node}
            </div>
          ))}
        </div>

        {showArrows && len > 1 && (
          <>
            <button
              type="button"
              aria-label="previous"
              onClick={() => go(safeIdx - 1)}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white border border-gray-200 shadow-sm"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="next"
              onClick={() => go(safeIdx + 1)}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white border border-gray-200 shadow-sm"
            >
              ›
            </button>
          </>
        )}
      </div>

      {showDots && len > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === safeIdx ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

