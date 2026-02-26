'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/types/product';
import CameraStream from '@/components/customer/CameraStream';
import QueueWidget from '@/components/customer/QueueWidget';
import TicketDisplay from '@/components/customer/TicketDisplay';
import VideoCallModal from '@/components/customer/VideoCallModal';
import PaymentFlow from '@/components/shared/PaymentFlow';
import { useQueue } from '@/hooks/useQueue';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';

export default function CustomerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [incomingCallData, setIncomingCallData] = useState<{
    sellerSocketId: string;
    ticketId: string;
  } | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { myTicket, isLoading, error, drawNumber, clearTicket } = useQueue();
  const socket = useSocket();

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

  const { callState, answerCall, hangUp } = useWebRTC({
    sendSignal: socket.sendSignal,
    onSignal: handleSignal,
    offSignal,
    localVideoRef,
    remoteVideoRef,
  });

  // Load products
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  // Socket event listeners
  useEffect(() => {
    const onIncomingCall = (data: { sellerSocketId: string; ticketId: string }) => {
      setIncomingCallData(data);
    };
    const onHangup = () => {
      hangUp();
      setIncomingCallData(null);
      setShowPayment(true);
    };

    socket.on('rtc:incoming-call', onIncomingCall as (...args: unknown[]) => void);
    socket.on('rtc:hangup', onHangup as (...args: unknown[]) => void);

    return () => {
      socket.off('rtc:incoming-call', onIncomingCall as (...args: unknown[]) => void);
      socket.off('rtc:hangup', onHangup as (...args: unknown[]) => void);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hangUp]);

  const handleDrawNumber = async (name?: string) => {
    const ticket = await drawNumber(name);
    if (ticket && socket.socket) {
      socket.joinQueue(ticket.id);
    }
    return ticket;
  };

  const handleAcceptCall = (sellerSocketId: string, ticketId: string) => {
    setIncomingCallData(null);
    socket.acceptCall(sellerSocketId, ticketId);
    answerCall(sellerSocketId);
  };

  const handleRejectCall = (sellerSocketId: string, ticketId: string) => {
    setIncomingCallData(null);
    socket.rejectCall(sellerSocketId, ticketId);
  };

  const handleHangUp = () => {
    if (incomingCallData) {
      socket.hangUp(incomingCallData.sellerSocketId, myTicket?.id);
    }
    hangUp();
    setShowPayment(true);
  };

  const handlePaymentComplete = (method: 'pickup' | 'delivery', address?: string) => {
    if (myTicket) {
      socket.completePayment(myTicket.id, method, address);
    }
    setShowPayment(false);
    clearTicket();
  };

  const liveTicket = myTicket
    ? socket.queueTickets.find(t => t.id === myTicket.id) ?? myTicket
    : null;

  const waitingAhead = liveTicket
    ? socket.queueTickets.filter(
        t => t.status === 'waiting' && t.number < liveTicket.number
      ).length
    : 0;

  const waitingCount = socket.queueTickets.filter(
    t => t.status === 'waiting' || t.status === 'called'
  ).length;

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧀</span>
            <div>
              <h1 className="font-bold text-stone-800 dark:text-stone-200 leading-tight">
                Käsetheke Digital
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Entdecken Sie unsere Auswahl
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${socket.isConnected ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {socket.isConnected ? 'Live' : 'Verbinde...'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Camera stream with AI detection */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300">
              Live-Käsetheke
            </h2>
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
          <CameraStream
              products={products}
              requestCamStream={socket.requestCamStream}
              sendCamSignal={socket.sendCamSignal}
              onCamSignal={(handler) => socket.on('cam:signal-forward', handler as (...args: unknown[]) => void)}
              offCamSignal={(handler) => socket.off('cam:signal-forward', handler as (...args: unknown[]) => void)}
              isConnected={socket.isConnected}
            />
        </section>

        {/* Queue + Info */}
        <section className="grid md:grid-cols-2 gap-4">
          {liveTicket && liveTicket.status !== 'done' ? (
            <TicketDisplay
              ticket={liveTicket}
              waitingAhead={waitingAhead}
              onCancel={clearTicket}
            />
          ) : (
            <QueueWidget
              onDraw={handleDrawNumber}
              isLoading={isLoading}
              error={error}
              queueLength={waitingCount}
            />
          )}

          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 p-5">
            <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
              <span>ℹ️</span> So funktioniert es
            </h3>
            <ol className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
              <li className="flex gap-2">
                <span className="font-bold shrink-0">1.</span>
                Entdecken Sie Käse per KI – klicken Sie auf markierte Stücke
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">2.</span>
                Ziehen Sie eine virtuelle Wartennummer
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">3.</span>
                Werden Sie per Video-Call live beraten
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">4.</span>
                Wählen Sie Abholung oder Lieferung
              </li>
            </ol>
          </div>
        </section>
      </div>

      {/* Video call */}
      <VideoCallModal
        callState={callState}
        incomingCallData={incomingCallData}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
        onHangUp={handleHangUp}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
      />

      {/* Payment */}
      {showPayment && liveTicket && (
        <PaymentFlow
          ticketId={liveTicket.id}
          ticketNumber={liveTicket.number}
          onComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
    </main>
  );
}
