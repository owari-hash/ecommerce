'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, type Easing } from 'framer-motion';

function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}

interface LensProps {
  children: React.ReactNode;
  zoomFactor?: number;
  lensSize?: number;
  position?: { x: number; y: number };
  isStatic?: boolean;
  hovering?: boolean;
  setHovering?: (v: boolean) => void;
  className?: string;
  borderRadius?: string;
  borderWidth?: number;
  borderColor?: string;
  shadowIntensity?: 'none' | 'light' | 'medium' | 'heavy';
  animationDuration?: number;
  animationEasing?: Easing | Easing[];
  maskShape?: 'circle' | 'square';
  opacity?: number;
  blurEdge?: boolean;
  smoothFollow?: boolean;
  disabled?: boolean;
}

export const Lens: React.FC<LensProps> = ({
  children,
  zoomFactor = 1.5,
  lensSize = 170,
  isStatic = false,
  position = { x: 200, y: 150 },
  hovering,
  setHovering,
  className,
  borderRadius = 'lg',
  borderWidth = 0,
  borderColor = 'border-gray-300',
  shadowIntensity = 'medium',
  animationDuration = 0.3,
  animationEasing = 'easeOut',
  maskShape = 'circle',
  opacity = 1,
  blurEdge = false,
  smoothFollow = true,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localIsHovering, setLocalIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });

  const isHovering = hovering !== undefined ? hovering : localIsHovering;
  const setIsHovering = setHovering || setLocalIsHovering;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || isStatic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (smoothFollow) {
      setMousePosition({ x, y });
    } else {
      const g = 20;
      setMousePosition({ x: Math.round(x / g) * g, y: Math.round(y / g) * g });
    }
  };

  const shadowClasses = { none: '', light: 'shadow-sm', medium: 'shadow-md', heavy: 'shadow-xl' };

  const getMaskImage = (x: number, y: number) => {
    const r = lensSize / 2;
    const shape =
      maskShape === 'circle'
        ? `circle ${r}px at ${x}px ${y}px`
        : `ellipse ${r}px ${r}px at ${x}px ${y}px`;
    return blurEdge
      ? `radial-gradient(${shape}, black 60%, transparent 100%)`
      : `radial-gradient(${shape}, black 100%, transparent 100%)`;
  };

  const cx = isStatic ? position.x : mousePosition.x;
  const cy = isStatic ? position.y : mousePosition.y;

  const lensContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.58 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: animationDuration, ease: animationEasing }}
      className={cn(
        'absolute inset-0 overflow-hidden',
        borderWidth > 0 && `border-${borderWidth} ${borderColor}`,
        shadowClasses[shadowIntensity]
      )}
      style={{
        maskImage: getMaskImage(cx, cy),
        WebkitMaskImage: getMaskImage(cx, cy),
        transformOrigin: `${cx}px ${cy}px`,
        zIndex: 50,
      }}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `scale(${zoomFactor})`, transformOrigin: `${cx}px ${cy}px` }}
      >
        {children}
      </div>
    </motion.div>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden z-20 h-full w-full',
        `rounded-${borderRadius}`,
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onMouseEnter={() => !disabled && setIsHovering(true)}
      onMouseLeave={() => !disabled && setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      {isStatic ? (
        lensContent
      ) : (
        <AnimatePresence>
          {isHovering && !disabled && lensContent}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Lens;
