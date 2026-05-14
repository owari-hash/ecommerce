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
  showArrows = false,
  ariaLabel = 'carousel',
}: Props) {
  const len = slides.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const drag = useRef<{
    startX: number;
    prevX: number;
    prevTime: number;
    velocity: number; // px/ms
    active: boolean;
    captured: boolean; // pointer capture only set after threshold crossed
  }>({ startX: 0, prevX: 0, prevTime: 0, velocity: 0, active: false, captured: false });

  const safeIdx = useMemo(() => clampIndex(idx, len), [idx, len]);

  useEffect(() => {
    const playbackMs = autoplayMs || 5000;
    if (playbackMs < 1000) return;
    if (paused) return;
    if (len <= 1) return;

    const t = window.setInterval(() => setIdx((x) => x + 1), playbackMs);
    return () => window.clearInterval(t);
  }, [autoplayMs, paused, len]);

  if (len === 0) return null;

  const go = (next: number) => setIdx(clampIndex(next, len));

  const endDrag = (el: HTMLElement, pointerId: number) => {
    if (!drag.current.active) return;
    const dx = drag.current.prevX - drag.current.startX;
    const v = drag.current.velocity;
    drag.current.active = false;
    if (drag.current.captured) {
      el.releasePointerCapture(pointerId);
      drag.current.captured = false;
    }
    setPaused(false);
    setDragging(false);
    setDragOffset(0);

    if (dx < -40 || v < -0.4) go(safeIdx + 1);
    else if (dx > 40 || v > 0.4) go(safeIdx - 1);
  };

  return (
    <section
      aria-label={ariaLabel}
      className={className}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`relative overflow-hidden ${viewportClassName ?? ''}`}>
        <div
          className={`flex will-change-transform select-none cursor-grab active:cursor-grabbing touch-pan-y ${
            dragging ? '' : 'transition-transform duration-500 ease-out'
          }`}
          style={{ transform: `translateX(calc(-${safeIdx * 100}% + ${dragOffset}px))` }}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            const now = Date.now();
            drag.current = { startX: e.clientX, prevX: e.clientX, prevTime: now, velocity: 0, active: true, captured: false };
            setPaused(true);
          }}
          onPointerMove={(e) => {
            if (!drag.current.active) return;
            const now = Date.now();
            const dt = now - drag.current.prevTime;
            if (dt > 0) drag.current.velocity = (e.clientX - drag.current.prevX) / dt;
            drag.current.prevX = e.clientX;
            drag.current.prevTime = now;
            const offset = e.clientX - drag.current.startX;
            // Capture pointer only once drag threshold is crossed — preserves click events on tap
            if (!drag.current.captured && Math.abs(offset) > 8) {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              drag.current.captured = true;
              setDragging(true);
            }
            if (drag.current.captured) setDragOffset(offset);
          }}
          onPointerUp={(e) => endDrag(e.currentTarget as HTMLElement, e.pointerId)}
          onPointerCancel={(e) => endDrag(e.currentTarget as HTMLElement, e.pointerId)}
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
