'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
    <main className="min-h-screen bg-[#F9F6F1]" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>

      {/* Navigation */}
      <header className="bg-[#F9F6F1] h-20 flex items-center justify-between px-16 sticky top-0 z-10 border-b border-[#E8DFD0]">
        <Link href="/" className="text-[28px] text-[#2C2416]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
          Käserei
        </Link>
        <nav className="flex items-center gap-12">
          {(['Sortiment', 'Erzeuger', 'Wissen', 'Über uns'] as const).map(link => (
            <Link key={link} href="#" className="text-[15px] text-[#2C2416] hover:text-[#7A6040] transition-colors">
              {link}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${socket.isConnected ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="text-[13px] text-[#7A6040]">
              {socket.isConnected ? 'Live' : 'Verbinde...'}
            </span>
          </div>
          <Link href="/" className="bg-[#2C2416] text-[#F9F6F1] text-[13px] font-medium px-5 py-2.5 rounded-sm hover:bg-[#3d3020] transition-colors">
            Warenkorb
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-[#EDE6DA] flex items-center gap-2 px-16 py-3">
        <Link href="/" className="text-[13px] text-[#7A6040] hover:text-[#2C2416] transition-colors">Startseite</Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A08060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        <span className="text-[13px] font-medium text-[#2C2416]">Live-Käsetheke</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Camera stream with AI detection */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[22px] text-[#2C2416]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
              Live-Käsetheke
            </h2>
            <span className="text-[12px] bg-red-500 text-white px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
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

          <div className="bg-[#EDE6DA] rounded border border-[#E8DFD0] p-5">
            <h3 className="font-semibold text-[#2C2416] mb-3 text-[15px]" style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic' }}>
              So funktioniert es
            </h3>
            <ol className="space-y-2.5">
              {[
                'Entdecken Sie Käse per KI – klicken Sie auf markierte Stücke',
                'Ziehen Sie eine virtuelle Wartennummer',
                'Werden Sie per Video-Call live beraten',
                'Wählen Sie Abholung oder Lieferung',
              ].map((step, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] text-[#6B5C45]">
                  <span className="font-semibold text-[#7A6040] shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
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
