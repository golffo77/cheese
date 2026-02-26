'use client';

import { useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';

interface CuttingTableStreamProps {
  deviceId?: string;
}

export default function CuttingTableStream({ deviceId }: CuttingTableStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsUrl = process.env.NEXT_PUBLIC_CAM2_HLS_URL;

  const { isReady, error, startCamera } = useCamera({
    videoRef,
    mode: hlsUrl ? 'ip' : 'webcam',
    hlsUrl,
    deviceId,
    waitForDeviceId: !hlsUrl, // in webcam mode, wait until deviceId is known
  });

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
        <h3 className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Kamera 2 – Schneidtisch
        </h3>
        {!isReady && !error && (
          <span className="text-xs text-stone-400">Verbindung...</span>
        )}
      </div>

      <div className="aspect-video bg-black relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-stone-900">
            <p className="text-sm text-stone-400 mb-3">Kamera nicht verfügbar</p>
            <button
              onClick={startCamera}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
