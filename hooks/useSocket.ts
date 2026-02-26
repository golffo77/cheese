'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { QueueTicket } from '@/types/queue';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  queueTickets: QueueTicket[];
  // Queue actions
  joinQueue: (ticketId: string) => void;
  requestQueue: () => void;
  // Seller actions
  callTicket: (ticketId: string) => void;
  doneTicket: (ticketId: string) => void;
  // RTC
  initiateCall: (ticketId: string, customerSocketId: string) => void;
  acceptCall: (sellerSocketId: string, ticketId: string) => void;
  rejectCall: (sellerSocketId: string, ticketId: string) => void;
  sendSignal: (targetSocketId: string, signal: unknown) => void;
  hangUp: (targetSocketId: string, ticketId?: string) => void;
  // Payment
  completePayment: (ticketId: string, method: 'pickup' | 'delivery', address?: string) => void;
  // Camera broadcast
  registerSellerCam: () => void;
  requestCamStream: () => void;
  sendCamSignal: (targetSocketId: string, signal: unknown) => void;
  // Event subscriptions
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [queueTickets, setQueueTickets] = useState<QueueTicket[]>([]);

  useEffect(() => {
    const socket = io({ path: '/api/socket', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('queue:update', (tickets: QueueTicket[]) => setQueueTickets(tickets));

    return () => {
      socket.disconnect();
    };
  }, []);

  const callMethod = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    queueTickets,
    joinQueue: (ticketId) => callMethod('queue:join', { ticketId }),
    requestQueue: () => callMethod('queue:request'),
    callTicket: (ticketId) => callMethod('queue:call', { ticketId }),
    doneTicket: (ticketId) => callMethod('queue:done', { ticketId }),
    initiateCall: (ticketId, customerSocketId) =>
      callMethod('rtc:call', { ticketId, customerSocketId }),
    acceptCall: (sellerSocketId, ticketId) =>
      callMethod('rtc:accept', { sellerSocketId, ticketId }),
    rejectCall: (sellerSocketId, ticketId) =>
      callMethod('rtc:reject', { sellerSocketId, ticketId }),
    sendSignal: (targetSocketId, signal) =>
      callMethod('rtc:signal', { targetSocketId, signal }),
    hangUp: (targetSocketId, ticketId) =>
      callMethod('rtc:hangup', { targetSocketId, ticketId }),
    completePayment: (ticketId, method, address) =>
      callMethod('payment:complete', { ticketId, method, address }),
    registerSellerCam: () => callMethod('cam:register-seller'),
    requestCamStream: () => callMethod('cam:request'),
    sendCamSignal: (targetSocketId, signal) =>
      callMethod('cam:signal', { targetSocketId, signal }),
    on: (event, handler) => socketRef.current?.on(event, handler),
    off: (event, handler) => socketRef.current?.off(event, handler),
  };
}
