/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface HeroPillButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isOutline?: boolean;
  className?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  icon?: React.ReactNode;
}

export const HeroPillButton: React.FC<HeroPillButtonProps> = ({
  label,
  onClick,
  isOutline = false,
  className = '',
  onHoverStart,
  onHoverEnd,
  icon,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverStart?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    onHoverEnd?.();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`group relative overflow-hidden inline-flex items-center justify-center rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer select-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform ${
        isOutline
          ? 'bg-transparent text-[#F4F5F2] border border-white/80'
          : 'bg-[#F4F5F2] text-[#07111F] border border-black/10'
      } ${className}`}
      style={{
        transform: `scale(${isPressed ? 0.96 : isHovered ? 1.025 : 1})`,
      }}
    >
      {/* Sliding Fill Background */}
      <span
        className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isOutline
            ? 'bg-[#F4F5F2]'
            : 'bg-[#07111F] border border-[#7CCBFF]/40'
        }`}
        style={{
          transform: isHovered ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 105%, 0)',
        }}
      />

      {/* Soft Shimmer Highlight sweeping across */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isOutline
            ? 'linear-gradient(90deg, transparent, rgba(124,203,255,0.25), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      />

      {/* Button Content */}
      <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-400">
        {/* Animated Arrow emerging on hover for white pills */}
        {!isOutline && (
          <span
            className="inline-flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] text-[#7CCBFF]"
            style={{
              width: isHovered ? '14px' : '0px',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateX(0px)' : 'translateX(-8px)',
              overflow: 'hidden',
            }}
            aria-hidden="true"
          >
            →
          </span>
        )}

        {/* Text with subtle horizontal translation */}
        <span
          className={`transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] font-medium ${
            isOutline
              ? isHovered
                ? 'text-[#07111F]'
                : 'text-[#F4F5F2]'
              : isHovered
              ? 'text-[#F4F5F2] translate-x-1'
              : 'text-[#07111F]'
          }`}
        >
          {label}
        </span>

        {/* Optional trailing icon (like the copy icon for outline button) */}
        {icon && (
          <span
            className={`transition-colors duration-400 ml-1.5 ${
              isOutline && isHovered ? 'text-[#07111F]' : 'text-[#7CCBFF]'
            }`}
          >
            {icon}
          </span>
        )}
      </span>
    </button>
  );
};
