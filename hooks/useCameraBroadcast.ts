'use client';

import { useEffect, useRef } from 'react';
import SimplePeer, { Instance as PeerInstance } from 'simple-peer';

interface UseCameraBroadcastOptions {
  stream: MediaStream | null;
  sendCamSignal: (targetSocketId: string, signal: unknown) => void;
  onCamRequest: (handler: (data: { buyerSocketId: string }) => void) => void;
  offCamRequest: (handler: (data: { buyerSocketId: string }) => void) => void;
  onCamSignal: (handler: (data: { fromSocketId: string; signal: unknown }) => void) => void;
  offCamSignal: (handler: (data: { fromSocketId: string; signal: unknown }) => void) => void;
}

export function useCameraBroadcast({
  stream,
  sendCamSignal,
  onCamRequest,
  offCamRequest,
  onCamSignal,
  offCamSignal,
}: UseCameraBroadcastOptions) {
  const peersRef = useRef<Map<string, PeerInstance>>(new Map());
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    const handleRequest = ({ buyerSocketId }: { buyerSocketId: string }) => {
      if (!streamRef.current) return;
      if (peersRef.current.has(buyerSocketId)) return;
      const peer = new SimplePeer({
        initiator: true,
        stream: streamRef.current,
        trickle: true,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
      });

      peersRef.current.set(buyerSocketId, peer);

      peer.on('signal', (data) => {
        sendCamSignal(buyerSocketId, data);
      });

      peer.on('close', () => {
        peersRef.current.delete(buyerSocketId);
      });

      peer.on('error', () => {
        peersRef.current.delete(buyerSocketId);
      });
    };

    const handleSignal = ({ fromSocketId, signal }: { fromSocketId: string; signal: unknown }) => {
      const peer = peersRef.current.get(fromSocketId);
      peer?.signal(signal as SimplePeer.SignalData);
    };

    onCamRequest(handleRequest);
    onCamSignal(handleSignal);

    return () => {
      offCamRequest(handleRequest);
      offCamSignal(handleSignal);
    };
  }, [sendCamSignal, onCamRequest, offCamRequest, onCamSignal, offCamSignal]);

  useEffect(() => {
    return () => {
      peersRef.current.forEach((peer) => peer.destroy());
      peersRef.current.clear();
    };
  }, []);
}
