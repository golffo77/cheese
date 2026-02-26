import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { queueStore } from './queue-store';
import { QueueTicket } from '@/types/queue';

export type SocketServer = SocketIOServer;

declare global {
  // eslint-disable-next-line no-var
  var __socketServer: SocketIOServer | undefined;
}

export function getSocketServer(): SocketIOServer | undefined {
  return globalThis.__socketServer;
}

export function initSocketServer(httpServer: NetServer): SocketIOServer {
  if (globalThis.__socketServer) {
    return globalThis.__socketServer;
  }

  const io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);

    // ─── Queue Events ────────────────────────────────────────────
    socket.on('queue:join', (data: { ticketId: string }) => {
      // Associate the socket with a ticket
      queueStore.updateSocketId(data.ticketId, socket.id);
      socket.join(`ticket:${data.ticketId}`);
      emitQueueUpdate(io);
    });

    socket.on('queue:request', () => {
      // Customer requests the full queue state
      socket.emit('queue:update', queueStore.getAll());
    });

    // ─── Seller Queue Actions ─────────────────────────────────────
    socket.on('queue:call', (data: { ticketId: string }) => {
      const ticket = queueStore.updateStatus(data.ticketId, 'called');
      if (ticket) {
        emitQueueUpdate(io);
        // Notify the specific customer
        if (ticket.socketId) {
          io.to(ticket.socketId).emit('queue:called', { ticket });
        }
      }
    });

    socket.on('queue:done', (data: { ticketId: string }) => {
      const ticket = queueStore.updateStatus(data.ticketId, 'done');
      if (ticket) emitQueueUpdate(io);
    });

    // ─── WebRTC Signaling ─────────────────────────────────────────
    // Seller initiates call to customer
    socket.on('rtc:call', (data: { ticketId: string; customerSocketId: string }) => {
      const ticket = queueStore.updateStatus(data.ticketId, 'serving');
      if (ticket) emitQueueUpdate(io);

      socket.to(data.customerSocketId).emit('rtc:incoming-call', {
        sellerSocketId: socket.id,
        ticketId: data.ticketId,
      });
    });

    // Customer accepts call
    socket.on('rtc:accept', (data: { sellerSocketId: string; ticketId: string }) => {
      socket.to(data.sellerSocketId).emit('rtc:accepted', {
        customerSocketId: socket.id,
        ticketId: data.ticketId,
      });
    });

    // Customer rejects call
    socket.on('rtc:reject', (data: { sellerSocketId: string; ticketId: string }) => {
      socket.to(data.sellerSocketId).emit('rtc:rejected', {
        customerSocketId: socket.id,
      });
    });

    // Relay WebRTC signals (SDP + ICE candidates)
    socket.on('rtc:signal', (data: { targetSocketId: string; signal: unknown }) => {
      socket.to(data.targetSocketId).emit('rtc:signal', {
        fromSocketId: socket.id,
        signal: data.signal,
      });
    });

    // Hang up
    socket.on('rtc:hangup', (data: { targetSocketId: string; ticketId?: string }) => {
      if (data.ticketId) {
        queueStore.updateStatus(data.ticketId, 'done');
        emitQueueUpdate(io);
      }
      socket.to(data.targetSocketId).emit('rtc:hangup', {
        fromSocketId: socket.id,
      });
    });

    // ─── Payment Events ───────────────────────────────────────────
    socket.on('payment:complete', (data: { ticketId: string; method: 'pickup' | 'delivery'; address?: string }) => {
      const ticket = queueStore.getById(data.ticketId);
      if (ticket) {
        // Notify seller
        io.emit('payment:received', {
          ticket,
          method: data.method,
          address: data.address,
        });
      }
    });

    // ─── Camera Broadcast ─────────────────────────────────────────
    // Seller registers as camera broadcaster
    socket.on('cam:register-seller', () => {
      socket.join('sellers');
      console.log('[Socket] Seller registered for cam broadcast:', socket.id);
    });

    // Buyer requests camera stream from seller
    socket.on('cam:request', () => {
      // Forward request to seller, include buyer socketId
      socket.to('sellers').emit('cam:request-forward', { buyerSocketId: socket.id });
    });

    // Relay WebRTC signals for camera stream
    socket.on('cam:signal', (data: { targetSocketId: string; signal: unknown }) => {
      socket.to(data.targetSocketId).emit('cam:signal-forward', {
        fromSocketId: socket.id,
        signal: data.signal,
      });
    });

    // ─── Disconnect ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id);
    });
  });

  globalThis.__socketServer = io;
  console.log('[Socket] Server initialized');
  return io;
}

function emitQueueUpdate(io: SocketIOServer) {
  const tickets: QueueTicket[] = queueStore.getAll();
  io.emit('queue:update', tickets);
}
