'use client';

import { useRef, useState } from 'react';
import { useYOLO } from '@/hooks/useYOLO';
import { useCameraReceiver } from '@/hooks/useCameraReceiver';
import { Detection } from '@/types/detection';
import { Product } from '@/types/product';
import BoundingBoxOverlay from './BoundingBoxOverlay';
import ProductPopup from './ProductPopup';

interface CameraStreamProps {
  products: Product[];
  requestCamStream: () => void;
  sendCamSignal: (targetSocketId: string, signal: unknown) => void;
  onCamSignal: (handler: (data: { fromSocketId: string; signal: unknown }) => void) => void;
  offCamSignal: (handler: (data: { fromSocketId: string; signal: unknown }) => void) => void;
  isConnected: boolean;
}

export default function CameraStream({ products, requestCamStream, sendCamSignal, onCamSignal, offCamSignal, isConnected }: CameraStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { isReady, error: cameraError } = useCameraReceiver({
    videoRef,
    requestCamStream,
    sendCamSignal,
    onCamSignal,
    offCamSignal,
    isConnected,
  });

  const { detections, isProcessing, lastError } = useYOLO({
    videoRef,
    enabled: isReady,
    intervalMs: 1500,
  });

  const handleBoxClick = (detection: Detection) => {
    if (!detection.product_id) return;
    const product = products.find(p => p.id === detection.product_id);
    if (product) setSelectedProduct(product);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Video element */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Bounding box overlay */}
        {isReady && (
          <BoundingBoxOverlay
            detections={detections}
            onBoxClick={handleBoxClick}
          />
        )}

        {/* Loading state */}
        {!isReady && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Kamera wird gestartet...</p>
            </div>
          </div>
        )}

        {/* Camera error */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center text-white max-w-sm px-4">
              <div className="text-4xl mb-3">📷</div>
              <p className="font-semibold mb-1">Kamera nicht verfügbar</p>
              <p className="text-sm text-gray-400">{cameraError ?? 'Verbindung zum Laden wird aufgebaut...'}</p>
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute top-3 right-3 bg-amber-500/90 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
            KI analysiert...
          </div>
        )}

        {/* YOLO error */}
        {lastError && (
          <div className="absolute bottom-3 left-3 bg-red-900/90 text-white text-xs px-3 py-1.5 rounded-lg">
            KI: {lastError}
          </div>
        )}

        {/* Detection count */}
        {isReady && detections.length > 0 && (
          <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
            {detections.length} Käse erkannt
          </div>
        )}
      </div>

      {/* Hint */}
      {isReady && detections.length > 0 && (
        <p className="text-center text-sm text-amber-700 dark:text-amber-400 mt-2 animate-pulse">
          Klicken Sie auf einen markierten Käse für Details
        </p>
      )}

      {/* Product popup */}
      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
