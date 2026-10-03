/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface RollingTextProps {
  text: string;
  className?: string;
  duplicateClassName?: string;
  isHovered?: boolean;
}

/**
 * Editorial dual-layer rolling text component with masked vertical displacement.
 * On hover, the primary text translates upward (-100%) while a duplicate emerges from below (0%),
 * settling smoothly with a high-end cubic bezier.
 */
export const RollingText: React.FC<RollingTextProps> = ({
  text,
  className = '',
  duplicateClassName = 'text-[#7CCBFF]',
  isHovered: externalHovered,
}) => {
  const [internalHovered, setInternalHovered] = useState(false);
  const active = externalHovered !== undefined ? externalHovered : internalHovered;

  return (
    <span
      className={`relative inline-flex flex-col overflow-hidden leading-tight ${className}`}
      onMouseEnter={() => setInternalHovered(true)}
      onMouseLeave={() => setInternalHovered(false)}
      style={{ height: '1.25em' }}
    >
      {/* Primary layer */}
      <span
        className="inline-block transform transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform"
        style={{
          transform: active ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 0%, 0)',
        }}
        aria-hidden={active}
      >
        {text}
      </span>

      {/* Duplicate layer emerging from bottom */}
      <span
        className={`absolute top-0 left-0 inline-block transform transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform ${duplicateClassName}`}
        style={{
          transform: active ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 100%, 0)',
        }}
      >
        {text}
      </span>
    </span>
  );
};
