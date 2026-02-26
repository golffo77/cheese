'use client';

import { useRef } from 'react';
import { CallState } from '@/hooks/useWebRTC';

interface VideoCallModalProps {
  callState: CallState;
  incomingCallData: { sellerSocketId: string; ticketId: string } | null;
  onAccept: (sellerSocketId: string, ticketId: string) => void;
  onReject: (sellerSocketId: string, ticketId: string) => void;
  onHangUp: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoCallModal({
  callState,
  incomingCallData,
  onAccept,
  onReject,
  onHangUp,
  localVideoRef,
  remoteVideoRef,
}: VideoCallModalProps) {
  if (callState === 'idle' && !incomingCallData) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Incoming call */}
        {callState === 'idle' && incomingCallData && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
              📞
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Eingehender Anruf</h2>
            <p className="text-stone-400 mb-8">Ihr Käsefachmann möchte Sie beraten</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => onReject(incomingCallData.sellerSocketId, incomingCallData.ticketId)}
                className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-2xl transition-colors"
                title="Ablehnen"
              >
                📵
              </button>
              <button
                onClick={() => onAccept(incomingCallData.sellerSocketId, incomingCallData.ticketId)}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-2xl transition-colors animate-pulse"
                title="Annehmen"
              >
                📞
              </button>
            </div>
          </div>
        )}

        {/* Calling / connecting */}
        {(callState === 'calling') && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Verbindung wird aufgebaut...</h2>
          </div>
        )}

        {/* Active call */}
        {callState === 'connected' && (
          <>
            <div className="relative aspect-video bg-black">
              {/* Remote video (main) */}
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />

              {/* Local video (PiP) */}
              <div className="absolute bottom-4 right-4 w-32 aspect-video bg-stone-800 rounded-xl overflow-hidden border-2 border-amber-500 shadow-lg">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              </div>

              {/* Status */}
              <div className="absolute top-4 left-4 bg-green-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Verbunden
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 flex justify-center gap-4">
              <button
                onClick={onHangUp}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                Anruf beenden
              </button>
            </div>
          </>
        )}

        {/* Ended */}
        {callState === 'ended' && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">👋</div>
            <h2 className="text-xl font-bold text-white mb-2">Anruf beendet</h2>
            <p className="text-stone-400">Vielen Dank für Ihren Besuch!</p>
          </div>
        )}
      </div>
    </div>
  );
}
