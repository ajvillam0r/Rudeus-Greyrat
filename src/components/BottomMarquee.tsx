/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

export type MarqueeModalType =
  | 'ABOUT'
  | 'ABILITIES'
  | 'JOURNEY'
  | 'ARCHIVE'
  | 'STORY'
  | 'TIMELINE'
  | 'WORLD'
  | 'MAGIC_WATER'
  | 'MAGIC_EARTH'
  | 'MAGIC_FIRE'
  | 'MAGIC_WIND';

interface MarqueeItemDef {
  label: string;
  modal: MarqueeModalType;
  size: 'large' | 'medium' | 'small';
}

const MARQUEE_ITEMS: MarqueeItemDef[] = [
  { label: 'RUDEUS GREYRAT', modal: 'ABOUT', size: 'large' },
  { label: 'THE QUAGMIRE', modal: 'STORY', size: 'medium' },
  { label: 'SECOND LIFE', modal: 'ABOUT', size: 'medium' },
  { label: 'MAGIC UNIVERSITY', modal: 'JOURNEY', size: 'medium' },
  { label: 'FITTOA', modal: 'JOURNEY', size: 'small' },
  { label: 'SHARIA', modal: 'JOURNEY', size: 'small' },
  { label: 'WATER MAGIC', modal: 'MAGIC_WATER', size: 'medium' },
  { label: 'EARTH MAGIC', modal: 'MAGIC_EARTH', size: 'medium' },
  { label: 'WIND MAGIC', modal: 'MAGIC_WIND', size: 'medium' },
  { label: 'FIRE MAGIC', modal: 'MAGIC_FIRE', size: 'medium' },
  { label: 'DEMON EYE', modal: 'ABILITIES', size: 'medium' },
  { label: 'MAGIC ARMOR', modal: 'ABILITIES', size: 'medium' },
  { label: 'THE SIX-FACED WORLD', modal: 'WORLD', size: 'medium' },
];

interface BottomMarqueeProps {
  onItemClick: (modal: MarqueeModalType, e: React.MouseEvent<HTMLElement>) => void;
  onHoverItem?: (label: string | null) => void;
}

export const BottomMarquee: React.FC<BottomMarqueeProps> = ({
  onItemClick,
  onHoverItem,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Entrance reveal after initial load (600ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const renderGroup = (groupKey: string) => (
    <div
      key={groupKey}
      className="flex items-center shrink-0 py-2 sm:py-2.5 px-4"
      aria-hidden={groupKey !== 'group-a'}
    >
      {MARQUEE_ITEMS.map((item, idx) => {
        const isItemHovered = activeItem === `${groupKey}-${idx}`;
        return (
          <React.Fragment key={`${groupKey}-${item.label}-${idx}`}>
            {/* Elegant Separator */}
            <span
              className={`select-none mx-3 sm:mx-4 font-mono transition-opacity duration-300 ${
                idx % 2 === 0
                  ? 'text-[#7CCBFF]/80 text-[10px] sm:text-xs'
                  : 'text-[#A7B2BE]/40 text-xs sm:text-sm font-light'
              }`}
              aria-hidden="true"
            >
              {idx % 2 === 0 ? '✦' : '//'}
            </span>

            {/* Clickable Interactive Typography Label */}
            <button
              type="button"
              onClick={(e) => onItemClick(item.modal, e)}
              onMouseEnter={() => {
                setActiveItem(`${groupKey}-${idx}`);
                onHoverItem?.(item.label);
              }}
              onMouseLeave={() => {
                setActiveItem(null);
                onHoverItem?.(null);
              }}
              className="group relative inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-left font-['HelveticaNowDisplayW01-Rg',sans-serif] uppercase tracking-wider transition-all duration-300 select-none will-change-transform"
              style={{
                transform: isItemHovered ? 'scale(1.03) translateY(-1px)' : 'scale(1) translateY(0)',
              }}
            >
              <span
                className={`transition-colors duration-200 ${
                  item.size === 'large'
                    ? 'text-[12px] sm:text-[14px] md:text-[15px] font-medium tracking-tight text-[#F4F5F2]'
                    : item.size === 'medium'
                    ? 'text-[11px] sm:text-[13px] md:text-[13.5px] font-normal text-[#F4F5F2]/90'
                    : 'text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-[#A7B2BE]'
                } ${isItemHovered ? 'text-[#7CCBFF]' : ''}`}
              >
                {item.label}
              </span>

              {/* Emerging Animated Arrow on Item Hover */}
              <span
                className="text-[11px] text-[#7CCBFF] transition-all duration-300 ease-out"
                style={{
                  width: isItemHovered ? '12px' : '0px',
                  opacity: isItemHovered ? 1 : 0,
                  transform: isItemHovered ? 'translateX(0px)' : 'translateX(-4px)',
                  overflow: 'hidden',
                  display: 'inline-block',
                }}
                aria-hidden="true"
              >
                →
              </span>

              {/* Animated Expanding Underline */}
              <span
                className="absolute bottom-0 left-0 w-full h-[1px] bg-[#7CCBFF] origin-left transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                style={{
                  transform: isItemHovered ? 'scaleX(1)' : 'scaleX(0)',
                }}
              />
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveItem(null);
        onHoverItem?.(null);
      }}
      aria-label="Character Archive Ticker"
      className="fixed bottom-0 left-0 right-0 z-20 overflow-hidden bg-[#07111F]/80 backdrop-blur-[6px] border-t border-white/10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translate3d(0, 0, 0)' : 'translate3d(0, 100%, 0)',
        // Smooth edge fades using CSS mask
        maskImage: 'linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)',
        // Dynamic speed modulation: slows down smoothly when hovering over the marquee
        ['--marquee-duration' as any]: isHovered ? '140s' : '55s',
      }}
    >
      {/* Top Border Animated Energy Highlight Beam */}
      <div
        className="absolute top-0 left-0 w-48 h-[1px] bg-gradient-to-r from-transparent via-[#7CCBFF] to-transparent pointer-events-none animate-energy-beam"
        aria-hidden="true"
      />

      {/* 3 Identical Groups = 100% Mathematically Seamless Infinite Ribbon */}
      <div className="flex w-max animate-marquee-infinite">
        {renderGroup('group-a')}
        {renderGroup('group-b')}
        {renderGroup('group-c')}
      </div>
    </aside>
  );
};
