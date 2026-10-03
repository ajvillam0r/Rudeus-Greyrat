/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';

interface BackgroundVideoProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onSeeked: () => void;
  onLoadedMetadata: () => void;
}

/**
 * Isolated background video component.
 * Memoized to prevent any re-renders when parent states (modals, cursor, hover) change.
 * Maintains zero-scale and zero-filter stability so GPU compositing remains at 60fps.
 */
export const BackgroundVideo = memo<BackgroundVideoProps>(({
  videoRef,
  onSeeked,
  onLoadedMetadata,
}) => {
  return (
    <video
      ref={videoRef}
      src="https://flow-content.google/video/d4069dcc-3a9d-4fc7-b2c6-682a39d688b8?Expires=1791080774&KeyName=labs-flow-prod-cdn-key&Signature=R16AWRdAN79kgT0qlqEHN_iMCeU"
      muted
      playsInline
      preload="auto"
      onSeeked={onSeeked}
      onLoadedMetadata={onLoadedMetadata}
      className="fixed inset-0 z-0 w-full h-full object-cover pointer-events-none transform-gpu"
      style={{
        objectPosition: '70% center',
        transform: 'translateZ(0)',
      }}
    />
  );
});

BackgroundVideo.displayName = 'BackgroundVideo';
