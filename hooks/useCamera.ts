'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

export type CameraMode = 'webcam' | 'ip';

interface UseCameraOptions {
  mode?: CameraMode;
  hlsUrl?: string;
  deviceId?: string;
  /** If true, wait until deviceId is provided before starting */
  waitForDeviceId?: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

interface UseCameraReturn {
  isReady: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera({ mode, hlsUrl, deviceId, waitForDeviceId, videoRef }: UseCameraOptions): UseCameraReturn {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const resolvedMode = mode ?? (process.env.NEXT_PUBLIC_CAMERA_MODE as CameraMode) ?? 'webcam';

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    const video = videoRef.current;
    if (!video) return;

    if (resolvedMode === 'webcam') {
      try {
        const videoConstraints: MediaTrackConstraints = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }),
        };
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });
        streamRef.current = stream;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().catch(console.error);
          setIsReady(true);
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Kamerazugriff verweigert';
        setError(msg);
      }
    } else if (resolvedMode === 'ip') {
      const url = hlsUrl ?? process.env.NEXT_PUBLIC_CAM1_HLS_URL ?? '';
      if (!url) {
        setError('HLS URL nicht konfiguriert');
        return;
      }
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(console.error);
          setIsReady(true);
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setError(`HLS Fehler: ${data.type}`);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(console.error);
          setIsReady(true);
        });
      } else {
        setError('HLS wird von diesem Browser nicht unterstützt');
      }
    }
  }, [resolvedMode, hlsUrl, videoRef]);

  useEffect(() => {
    if (waitForDeviceId && deviceId === undefined) return;
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  return { isReady, error, startCamera, stopCamera };
}
