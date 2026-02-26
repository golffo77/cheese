'use client';

import { useRef } from 'react';
import { CallState } from '@/hooks/useWebRTC';
import { QueueTicket } from '@/types/queue';

interface CallControlsProps {
  callState: CallState;
  activeTicket: QueueTicket | null;
  onHangUp: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function CallControls({
  callState,
  activeTicket,
  onHangUp,
  localVideoRef,
  remoteVideoRef,
}: CallControlsProps) {
  if (callState === 'idle') return null;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
        <h3 className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          {callState === 'connected' && (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          Video-Beratung
          {activeTicket && (
            <span className="text-amber-500 ml-1">#{activeTicket.number}</span>
          )}
        </h3>
        {callState === 'connected' && (
          <button
            onClick={onHangUp}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Beenden
          </button>
        )}
      </div>

      {callState === 'calling' && (
        <div className="p-6 text-center">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-600 dark:text-stone-400 text-sm">Verbindung wird aufgebaut...</p>
        </div>
      )}

      {callState === 'connected' && (
        <div className="relative">
          {/* Remote video (customer) */}
          <div className="aspect-video bg-black">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
          </div>

          {/* Local PiP */}
          <div className="absolute bottom-3 right-3 w-24 aspect-video bg-stone-800 rounded-xl overflow-hidden border-2 border-amber-400 shadow-lg">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          </div>
        </div>
      )}

      {callState === 'ended' && (
        <div className="p-6 text-center">
          <div className="text-3xl mb-2">👋</div>
          <p className="text-stone-600 dark:text-stone-400 text-sm">Anruf beendet</p>
        </div>
      )}
    </div>
  );
}
