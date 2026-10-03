/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';

interface CustomCursorProps {
  cursorText?: string | null;
  isHovered?: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ cursorText, isHovered }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const updateLoop = () => {
      const ease = 0.22;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      setPos({
        x: Number(currentPos.current.x.toFixed(2)),
        y: Number(currentPos.current.y.toFixed(2)),
      });

      rafId.current = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    rafId.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        willChange: 'transform',
      }}
    >
      {/* Central pinpoint */}
      <div
        className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-[#7CCBFF] transition-transform duration-200 ease-out"
        style={{
          transform: isHovered ? 'scale(0)' : 'scale(1)',
        }}
      />

      {/* Outer trailing ring / badge */}
      <div
        className="absolute -top-4 -left-4 rounded-full border border-[#7CCBFF]/60 flex items-center justify-center transition-all duration-300 ease-out bg-[#07111F]/20 backdrop-blur-[1px]"
        style={{
          width: cursorText ? 'auto' : isHovered ? '42px' : '32px',
          height: isHovered || cursorText ? '32px' : '32px',
          padding: cursorText ? '0 12px' : '0',
          borderColor: isHovered || cursorText ? '#7CCBFF' : 'rgba(124, 203, 255, 0.45)',
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.15 : 1})`,
        }}
      >
        {cursorText && (
          <span className="text-[9px] font-mono tracking-widest text-[#7CCBFF] uppercase whitespace-nowrap font-medium">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
};
