'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Detection } from '@/types/detection';

interface UseYOLOOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  intervalMs?: number;
}

interface UseYOLOReturn {
  detections: Detection[];
  isProcessing: boolean;
  lastError: string | null;
}

export function useYOLO({ videoRef, enabled, intervalMs = 1500 }: UseYOLOOptions): UseYOLOReturn {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    // JPEG at 70% quality – good balance for API transfer speed
    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
  }, [videoRef]);

  const runDetection = useCallback(async () => {
    if (isProcessing) return;
    const frame = captureFrame();
    if (!frame) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDetections(data.detections ?? []);
      setLastError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erkennungsfehler';
      setLastError(msg);
      // Keep last valid detections on error
    } finally {
      setIsProcessing(false);
    }
  }, [captureFrame, isProcessing]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Run immediately, then on interval
    runDetection();
    intervalRef.current = setInterval(runDetection, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs]);

  return { detections, isProcessing, lastError };
}
