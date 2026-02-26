'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer, { Instance as PeerInstance } from 'simple-peer';

interface UseCameraReceiverOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  requestCamStream: () => void;
  sendCamSignal: (targetSocketId: string, signal: unknown) => void;
  onCamSignal: (handler: (data: { fromSocketId: string; signal: unknown }) => void) => void;
  offCamSignal: (handler: (data: { fromSocketId: string; signal: unknown }) => void) => void;
  isConnected: boolean;
}

interface UseCameraReceiverReturn {
  isReady: boolean;
  error: string | null;
}

export function useCameraReceiver({
  videoRef,
  requestCamStream,
  sendCamSignal,
  onCamSignal,
  offCamSignal,
  isConnected,
}: UseCameraReceiverOptions): UseCameraReceiverReturn {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const peerRef = useRef<PeerInstance | null>(null);
  const sellerSocketIdRef = useRef<string | null>(null);

  const destroyPeer = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    sellerSocketIdRef.current = null;
    setIsReady(false);
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    // Request stream from seller
    const timer = setTimeout(() => {
      requestCamStream();
    }, 500);

    // Retry every 5s if not yet connected
    const retryInterval = setInterval(() => {
      if (!isReady && !peerRef.current) {
        requestCamStream();
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(retryInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    const handleSignal = ({ fromSocketId, signal }: { fromSocketId: string; signal: unknown }) => {
      // First signal from seller – create peer
      if (!peerRef.current) {
        sellerSocketIdRef.current = fromSocketId;

        const peer = new SimplePeer({
          initiator: false,
          trickle: true,
          config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
        });

        peerRef.current = peer;

        peer.on('signal', (data) => {
          if (sellerSocketIdRef.current) {
            sendCamSignal(sellerSocketIdRef.current, data);
          }
        });

        peer.on('stream', (remoteStream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = remoteStream;
            videoRef.current.play().catch(console.error);
          }
          setIsReady(true);
          setError(null);
        });

        peer.on('close', () => {
          destroyPeer();
          setError('Kamera-Verbindung unterbrochen');
        });

        peer.on('error', (err) => {
          console.error('[CamReceiver] Peer error:', err);
          destroyPeer();
          setError('Kamera-Verbindungsfehler');
        });

        peer.signal(signal as SimplePeer.SignalData);
      } else if (fromSocketId === sellerSocketIdRef.current) {
        peerRef.current.signal(signal as SimplePeer.SignalData);
      }
    };

    onCamSignal(handleSignal);
    return () => {
      offCamSignal(handleSignal);
      destroyPeer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return { isReady, error };
}
