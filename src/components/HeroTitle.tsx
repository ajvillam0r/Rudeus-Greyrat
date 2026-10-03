/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface HeroTitleProps {
  displayed: string;
  done: boolean;
}

/**
 * Isolated hero typography component.
 * Attaches its subtle 1-3px cursor displacement directly to DOM nodes via requestAnimationFrame
 * to eliminate parent component re-renders during mousemove.
 */
export const HeroTitle: React.FC<HeroTitleProps> = ({ displayed, done }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetOffset = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const deltaY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      targetOffset.current = {
        x: Number((deltaX * 2.5).toFixed(2)),
        y: Number((deltaY * 2.5).toFixed(2)),
      };

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(updateLoop);
      }
    };

    const handleMouseLeave = () => {
      targetOffset.current = { x: 0, y: 0 };
    };

    const updateLoop = () => {
      const ease = 0.15;
      currentOffset.current.x += (targetOffset.current.x - currentOffset.current.x) * ease;
      currentOffset.current.y += (targetOffset.current.y - currentOffset.current.y) * ease;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentOffset.current.x}px, ${currentOffset.current.y}px, 0)`;
      }

      const diff = Math.hypot(
        targetOffset.current.x - currentOffset.current.x,
        targetOffset.current.y - currentOffset.current.y
      );

      if (diff > 0.05) {
        rafId.current = requestAnimationFrame(updateLoop);
      } else {
        rafId.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="will-change-transform">
      {/* 1. Blurred intro label */}
      <div
        className="pointer-events-none select-none mb-4 sm:mb-5 text-[#F4F5F2]"
        style={{
          fontSize: 'clamp(18px, 4vw, 26px)',
          lineHeight: 1.3,
          fontWeight: 400,
          filter: 'blur(4px)',
        }}
      >
        Rudeus Greyrat,<br />
        the Quagmire
      </div>

      {/* 2. Typewriter text */}
      <p
        className="text-[#F4F5F2] mb-4 sm:mb-5"
        style={{
          fontSize: 'clamp(18px, 4vw, 26px)',
          lineHeight: 1.35,
          fontWeight: 400,
          minHeight: '54px',
          textShadow: '0 2px 14px rgba(7, 17, 31, 0.7)',
        }}
      >
        {displayed}
        {!done && (
          <span
            className="inline-block w-[2px] h-[1.1em] bg-[#7CCBFF] align-middle ml-[2px] animate-cursor-blink"
            aria-hidden="true"
          />
        )}
      </p>

      {/* Mana Core Active indicator */}
      <div className="flex items-center gap-2 mb-4 text-[10px] sm:text-[11px] tracking-[0.22em] text-[#7CCBFF]/80 font-mono select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7CCBFF] shadow-[0_0_8px_#7CCBFF]" />
        <span>MANA CORE // ACTIVE</span>
        <span className="text-[#A7B2BE]/40">•</span>
        <span className="text-[#A7B2BE]">SILENT INCANTATION</span>
      </div>
    </div>
  );
};
