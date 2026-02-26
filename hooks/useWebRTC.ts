'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer, { Instance as PeerInstance } from 'simple-peer';

export type CallState = 'idle' | 'incoming' | 'calling' | 'connected' | 'ended';

interface UseWebRTCOptions {
  sendSignal: (targetSocketId: string, signal: unknown) => void;
  onSignal: (handler: (data: { fromSocketId: string; signal: unknown }) => void) => void;
  offSignal: (handler: (data: { fromSocketId: string; signal: unknown }) => void) => void;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

interface UseWebRTCReturn {
  callState: CallState;
  remoteSocketId: string | null;
  startCall: (targetSocketId: string) => void;
  answerCall: (callerSocketId: string) => void;
  hangUp: () => void;
}

export function useWebRTC({
  sendSignal,
  onSignal,
  offSignal,
  localVideoRef,
  remoteVideoRef,
}: UseWebRTCOptions): UseWebRTCReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const peerRef = useRef<PeerInstance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const getLocalStream = useCallback(async (): Promise<MediaStream> => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
    }
    return stream;
  }, [localVideoRef]);

  const destroyPeer = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, [localVideoRef, remoteVideoRef]);

  const createPeer = useCallback(
    async (initiator: boolean, targetId: string) => {
      const stream = await getLocalStream();

      const peer = new SimplePeer({
        initiator,
        stream,
        trickle: true,
        config: {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        },
      });

      peerRef.current = peer;

      peer.on('signal', (data) => {
        sendSignal(targetId, data);
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(console.error);
        }
        setCallState('connected');
      });

      peer.on('close', () => {
        setCallState('ended');
        destroyPeer();
      });

      peer.on('error', (err) => {
        console.error('[WebRTC] Peer error:', err);
        setCallState('ended');
        destroyPeer();
      });

      return peer;
    },
    [getLocalStream, sendSignal, remoteVideoRef, destroyPeer]
  );

  const handleIncomingSignal = useCallback(
    ({ fromSocketId, signal }: { fromSocketId: string; signal: unknown }) => {
      if (fromSocketId !== remoteSocketId) return;
      peerRef.current?.signal(signal as SimplePeer.SignalData);
    },
    [remoteSocketId]
  );

  useEffect(() => {
    onSignal(handleIncomingSignal);
    return () => offSignal(handleIncomingSignal);
  }, [handleIncomingSignal, onSignal, offSignal]);

  const startCall = useCallback(
    async (targetSocketId: string) => {
      setRemoteSocketId(targetSocketId);
      setCallState('calling');
      await createPeer(true, targetSocketId);
    },
    [createPeer]
  );

  const answerCall = useCallback(
    async (callerSocketId: string) => {
      setRemoteSocketId(callerSocketId);
      setCallState('calling');
      await createPeer(false, callerSocketId);
    },
    [createPeer]
  );

  const hangUp = useCallback(() => {
    destroyPeer();
    setCallState('idle');
    setRemoteSocketId(null);
  }, [destroyPeer]);

  return { callState, remoteSocketId, startCall, answerCall, hangUp };
}
