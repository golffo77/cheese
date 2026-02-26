'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QueueTicket } from '@/types/queue';
import QueuePanel from '@/components/seller/QueuePanel';
import CuttingTableStream from '@/components/seller/CuttingTableStream';
import CallControls from '@/components/seller/CallControls';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useCameraBroadcast } from '@/hooks/useCameraBroadcast';

export default function SellerPage() {
  const [activeCallTicket, setActiveCallTicket] = useState<QueueTicket | null>(null);
  const [paymentNotification, setPaymentNotification] = useState<{
    ticket: QueueTicket;
    method: string;
    address?: string;
  } | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [cam1Stream, setCam1Stream] = useState<MediaStream | null>(null);
  const [cam2DeviceId, setCam2DeviceId] = useState<string | undefined>(undefined);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const socket = useSocket();

  // Enumerate cameras and start Käsetheke stream (cam1)
  useEffect(() => {
    if (!socket.isConnected) return;

    if (!navigator.mediaDevices?.enumerateDevices) {
      console.error('[Seller] navigator.mediaDevices nicht verfügbar – HTTPS erforderlich (oder chrome://flags/#unsafely-treat-insecure-origin-as-secure)');
      return;
    }

    (async () => {
      // Step 1: get permission first (deviceIds are empty without prior permission)
      let permStream: MediaStream | null = null;
      try {
        permStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err) {
        console.error('[Seller] Kamera-Erlaubnis verweigert:', err);
        return;
      }

      // Step 2: now enumerate with real deviceIds
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoCams = devices.filter(d => d.kind === 'videoinput');
      setCameraDevices(videoCams);

      // Stop the permission stream – we'll reopen with exact deviceId
      permStream.getTracks().forEach(t => t.stop());

      // Cam 1 = Käsetheke (built-in, index 0), Cam 2 = Schneidtisch (USB-C, index 1)
      const cam1 = videoCams[0];
      const cam2 = videoCams[1];

      if (cam2) setCam2DeviceId(cam2.deviceId);

      if (cam1) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: cam1.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          setCam1Stream(stream);
        } catch (err) {
          console.error('[Seller] Could not open cam1:', err);
        }
      }

      socket.registerSellerCam();
    })();

    return () => {
      cam1Stream?.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket.isConnected]);

  // Broadcast Käsetheke camera to buyers
  const onCamRequest = useCallback(
    (handler: (data: { buyerSocketId: string }) => void) => {
      socket.on('cam:request-forward', handler as (...args: unknown[]) => void);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const offCamRequest = useCallback(
    (handler: (data: { buyerSocketId: string }) => void) => {
      socket.off('cam:request-forward', handler as (...args: unknown[]) => void);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const onCamSignal = useCallback(
    (handler: (data: { fromSocketId: string; signal: unknown }) => void) => {
      socket.on('cam:signal-forward', handler as (...args: unknown[]) => void);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const offCamSignal = useCallback(
    (handler: (data: { fromSocketId: string; signal: unknown }) => void) => {
      socket.off('cam:signal-forward', handler as (...args: unknown[]) => void);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useCameraBroadcast({
    stream: cam1Stream,
    sendCamSignal: socket.sendCamSignal,
    onCamRequest,
    offCamRequest,
    onCamSignal,
    offCamSignal,
  });

  const handleSignal = useCallback(
    (handler: (data: { fromSocketId: string; signal: unknown }) => void) => {
      socket.on('rtc:signal', handler as (...args: unknown[]) => void);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const offSignal = useCallback(
    (handler: (data: { fromSocketId: string; signal: unknown }) => void) => {
      socket.off('rtc:signal', handler as (...args: unknown[]) => void);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { callState, remoteSocketId, startCall, hangUp } = useWebRTC({
    sendSignal: socket.sendSignal,
    onSignal: handleSignal,
    offSignal,
    localVideoRef,
    remoteVideoRef,
  });

  // Request initial queue state
  useEffect(() => {
    if (socket.isConnected) {
      socket.requestQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket.isConnected]);

  // Listen for WebRTC accepted + payment events
  useEffect(() => {
    const onAccepted = (data: { customerSocketId: string }) => {
      startCall(data.customerSocketId);
    };

    const onPayment = (data: { ticket: QueueTicket; method: string; address?: string }) => {
      setPaymentNotification(data);
      // Auto-dismiss after 10s
      setTimeout(() => setPaymentNotification(null), 10000);
    };

    const onHangup = () => {
      hangUp();
      setActiveCallTicket(null);
    };

    socket.on('rtc:accepted', onAccepted as (...args: unknown[]) => void);
    socket.on('payment:received', onPayment as (...args: unknown[]) => void);
    socket.on('rtc:hangup', onHangup as (...args: unknown[]) => void);

    return () => {
      socket.off('rtc:accepted', onAccepted as (...args: unknown[]) => void);
      socket.off('payment:received', onPayment as (...args: unknown[]) => void);
      socket.off('rtc:hangup', onHangup as (...args: unknown[]) => void);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCall, hangUp]);

  const handleCall = (ticket: QueueTicket) => {
    socket.callTicket(ticket.id);
  };

  const handleStartVideoCall = (ticket: QueueTicket) => {
    if (!ticket.socketId) return;
    setActiveCallTicket(ticket);
    socket.initiateCall(ticket.id, ticket.socketId);
  };

  const handleDone = (ticket: QueueTicket) => {
    socket.doneTicket(ticket.id);
    if (activeCallTicket?.id === ticket.id) {
      setActiveCallTicket(null);
    }
  };

  const handleHangUp = () => {
    if (remoteSocketId && activeCallTicket) {
      socket.hangUp(remoteSocketId, activeCallTicket.id);
    }
    hangUp();
    setActiveCallTicket(null);
  };

  return (
    <main className="min-h-screen bg-stone-100 dark:bg-stone-950">
      {/* Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧀</span>
            <div>
              <h1 className="font-bold text-stone-800 dark:text-stone-200 leading-tight">
                Verkäufer-Dashboard
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Käsetheke Digital – Interne Ansicht
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Add instore ticket */}
            <button
              onClick={async () => {
                await fetch('/api/queue', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'instore' }),
                });
              }}
              className="text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-lg transition-colors border border-stone-200 dark:border-stone-700"
            >
              + Vor-Ort-Ticket
            </button>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${socket.isConnected ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {socket.isConnected ? 'Verbunden' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Payment notification */}
      {paymentNotification && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                <span>✅</span>
                Bestellung erhalten – Ticket #{paymentNotification.ticket.number}
              </p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                {paymentNotification.method === 'pickup'
                  ? 'Abholung im Geschäft'
                  : `Lieferung an: ${paymentNotification.address}`}
              </p>
            </div>
            <button
              onClick={() => setPaymentNotification(null)}
              className="text-green-600 hover:text-green-800 ml-4 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Queue panel – takes 1 column */}
          <div className="lg:col-span-1">
            <QueuePanel
              tickets={socket.queueTickets}
              onCall={handleCall}
              onStartVideoCall={handleStartVideoCall}
              onDone={handleDone}
              activeCallTicketId={activeCallTicket?.id ?? null}
            />
          </div>

          {/* Camera + Video call – takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active call */}
            {callState !== 'idle' && (
              <CallControls
                callState={callState}
                activeTicket={activeCallTicket}
                onHangUp={handleHangUp}
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
              />
            )}

            {/* Käsetheke stream (cam1 – broadcast to buyers) */}
            <KaesethekeStream stream={cam1Stream} />

            {/* Cutting table stream */}
            <CuttingTableStream deviceId={cam2DeviceId} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Wartend"
                value={socket.queueTickets.filter(t => t.status === 'waiting').length}
                color="blue"
              />
              <StatCard
                label="In Beratung"
                value={socket.queueTickets.filter(t => t.status === 'serving').length}
                color="green"
              />
              <StatCard
                label="Erledigt"
                value={socket.queueTickets.filter(t => t.status === 'done').length}
                color="stone"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function KaesethekeStream({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
        <h3 className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${stream ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
          Kamera 1 – Käsetheke
        </h3>
        <span className="text-xs text-stone-400">{stream ? 'Live' : 'Kein Signal'}</span>
      </div>
      <div className="aspect-video bg-black relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p className="text-sm text-stone-400">Kamera wird gestartet...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    stone: 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  );
}
