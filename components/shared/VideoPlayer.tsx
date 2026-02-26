'use client';

import { useRef } from 'react';
import { useCamera, CameraMode } from '@/hooks/useCamera';

interface VideoPlayerProps {
  mode?: CameraMode;
  hlsUrl?: string;
  className?: string;
  showStatus?: boolean;
  onReady?: (videoEl: HTMLVideoElement) => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoPlayer({
  mode,
  hlsUrl,
  className = '',
  showStatus = false,
  videoRef: externalRef,
}: VideoPlayerProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalRef ?? internalRef;

  const { isReady, error, startCamera } = useCamera({ mode, hlsUrl, videoRef });

  return (
    <div className={`relative bg-black overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />

      {showStatus && !isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {showStatus && error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <p className="text-xs text-stone-400 mb-2">{error}</p>
          <button
            onClick={startCamera}
            className="text-xs bg-amber-500 px-3 py-1.5 rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {showStatus && isReady && (
        <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full" />
      )}
    </div>
  );
}
