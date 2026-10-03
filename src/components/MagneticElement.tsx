/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface MagneticElementProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // Maximum offset in pixels (default: 10)
  textStrength?: number; // Offset factor for inner text
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  ariaLabel?: string;
}

/**
 * High-performance magnetic wrapper using physical spring interpolation.
 * Button gently leans toward the cursor, while inner text and icons follow with differentiated mass.
 */
export const MagneticElement: React.FC<MagneticElementProps> = ({
  children,
  className = '',
  strength = 12,
  textStrength = 1.4,
  disabled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ariaLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  // Smooth lerp loop
  const updateMotion = useCallback(() => {
    const ease = 0.18; // smooth spring damping
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

    setOffset({
      x: Number(currentPos.current.x.toFixed(2)),
      y: Number(currentPos.current.y.toFixed(2)),
    });

    const dist = Math.hypot(
      targetPos.current.x - currentPos.current.x,
      targetPos.current.y - currentPos.current.y
    );

    if (dist > 0.05 || isHovered) {
      rafId.current = requestAnimationFrame(updateMotion);
    } else {
      currentPos.current = { x: 0, y: 0 };
      setOffset({ x: 0, y: 0 });
      rafId.current = null;
    }
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    targetPos.current = {
      x: Math.max(-strength, Math.min(strength, deltaX * strength)),
      y: Math.max(-strength, Math.min(strength, deltaY * strength)),
    };

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateMotion);
    }
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateMotion);
    }
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    targetPos.current = { x: 0, y: 0 };
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateMotion);
    }
    onMouseLeave?.();
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      className={`inline-block select-none cursor-pointer transition-transform ${className}`}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isPressed ? 0.97 : 1})`,
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      <div
        style={{
          transform: `translate3d(${offset.x * (textStrength - 1)}px, ${offset.y * (textStrength - 1)}px, 0)`,
          transition: 'transform 0.12s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};
