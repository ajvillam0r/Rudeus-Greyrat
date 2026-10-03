/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';

export interface OriginPoint {
  x: number;
  y: number;
}

interface CinematicModalProps {
  isOpen: boolean;
  onClose: () => void;
  originPoint: OriginPoint | null;
  sectionCode: string;
  headline: string;
  category: string;
  largeDisplayWord: string;
  children: React.ReactNode;
}

/**
 * Ultra-smooth, zero-lag cinematic modal.
 * - Stays pre-rendered in DOM (avoids mounting lag on click).
 * - GPU composited: animates only transform (translate3d, scale) and opacity.
 * - Dynamic transformOrigin based on single click calculation.
 * - will-change applied strictly during the active animation window.
 * - Staggered CSS transitions without extra JS re-render loops.
 */
export const CinematicModal: React.FC<CinematicModalProps> = ({
  isOpen,
  onClose,
  originPoint,
  sectionCode,
  headline,
  category,
  largeDisplayWord,
  children,
}) => {
  const [animating, setAnimating] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  // Default origin to center if not provided
  const originX = originPoint ? originPoint.x : typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const originY = originPoint ? originPoint.y : typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

  // Track animation state to toggle will-change dynamically
  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      const timer = window.setTimeout(() => {
        setAnimating(false);
      }, 480);
      return () => window.clearTimeout(timer);
    } else {
      setAnimating(true);
      const timer = window.setTimeout(() => {
        setAnimating(false);
      }, 380);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen
          ? 'opacity-100 pointer-events-auto visible'
          : 'opacity-0 pointer-events-none invisible'
      }`}
      style={{
        backgroundColor: isOpen ? 'rgba(7, 17, 31, 0.85)' : 'rgba(7, 17, 31, 0)',
        backdropFilter: isOpen ? 'blur(4px)' : 'none',
        WebkitBackdropFilter: isOpen ? 'blur(4px)' : 'none',
        transform: 'translateZ(0)',
      }}
      onClick={onClose}
    >
      {/* Dynamic Faint Arcane Geometry originating from clicked position */}
      <div
        className="absolute pointer-events-none transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: `${originX}px`,
          top: `${originY}px`,
          transform: `translate(-50%, -50%) scale(${isOpen ? 1 : 0.4})`,
          opacity: isOpen ? 0.08 : 0,
        }}
        aria-hidden="true"
      >
        <svg
          width="640"
          height="640"
          viewBox="0 0 500 500"
          fill="none"
          className="text-[#7CCBFF]"
        >
          <circle cx="250" cy="250" r="240" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 8" />
          <circle cx="250" cy="250" r="200" stroke="currentColor" strokeWidth="0.6" />
          <polygon points="250,50 423,350 77,350" stroke="currentColor" strokeWidth="0.6" />
          <polygon points="250,450 423,150 77,150" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="250" cy="250" r="140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 4" />
          <circle cx="250" cy="250" r="80" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Main Modal Shell: Instant GPU transform and opacity */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0B1D32] border border-[#7CCBFF]/30 text-[#F4F5F2] rounded-2xl shadow-[0_20px_60px_rgba(7,17,31,0.9)] overflow-hidden max-h-[88vh] flex flex-col transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transformOrigin: `${originX}px ${originY}px`,
          transform: isOpen
            ? 'translate3d(0, 0, 0) scale(1)'
            : 'translate3d(0, 20px, 0) scale(0.96)',
          opacity: isOpen ? 1 : 0,
          willChange: animating ? 'transform, opacity' : 'auto',
        }}
      >
        {/* Subtle top ambient aura line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7CCBFF] to-transparent opacity-75" />

        {/* Oversized Background Watermark Typography */}
        <div
          aria-hidden="true"
          className="absolute -top-6 -right-6 text-[120px] sm:text-[160px] font-black text-[#7CCBFF]/[0.025] select-none pointer-events-none leading-none tracking-tighter uppercase font-mono overflow-hidden"
        >
          {largeDisplayWord}
        </div>

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#7CCBFF] shadow-[0_0_8px_#7CCBFF]" />
            <span className="text-xs font-mono tracking-[0.2em] text-[#7CCBFF] uppercase">
              {sectionCode}
            </span>
          </div>

          {/* Animated Custom Close Button with rotating cross */}
          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#7CCBFF]/60 bg-white/5 hover:bg-[#7CCBFF]/10 text-xs font-mono tracking-widest text-[#A7B2BE] hover:text-[#F4F5F2] transition-colors duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <span
              className="inline-block transition-transform duration-200"
              style={{
                transform: closeHovered ? 'translateX(-2px)' : 'translateX(0)',
              }}
            >
              CLOSE
            </span>
            <span
              className="inline-flex items-center justify-center w-4 h-4 text-[#7CCBFF] transition-transform duration-300 ease-out"
              style={{
                transform: closeHovered ? 'rotate(90deg) scale(1.1)' : 'rotate(0deg) scale(1)',
              }}
            >
              ✕
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body with CSS-driven Layer Staggering */}
        <div className="p-6 sm:p-8 overflow-y-auto relative z-10 space-y-6">
          {/* Layer 3: Title & Category (50ms delay) */}
          <div
            className="transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transitionDelay: isOpen ? '50ms' : '0ms',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
            }}
          >
            <div className="text-[11px] uppercase tracking-[0.25em] text-[#7CCBFF] font-mono mb-1.5">
              {category}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#F4F5F2] leading-tight">
              {headline}
            </h2>
          </div>

          {/* Layer 4: Body Content (120ms delay) */}
          <div
            className="transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transitionDelay: isOpen ? '120ms' : '0ms',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(0, 14px, 0)',
            }}
          >
            {children}
          </div>
        </div>

        {/* Modal Bottom Footer Accent */}
        <div className="px-6 sm:px-8 py-3 bg-[#07111F]/70 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#A7B2BE] shrink-0">
          <span className="tracking-wider">RUDEUS GREYRAT // ARCHIVE CODEX</span>
          <span className="text-[#7CCBFF]/70">PRESS [ESC] TO EXIT</span>
        </div>
      </div>
    </div>
  );
};
