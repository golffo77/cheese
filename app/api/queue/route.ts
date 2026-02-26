import { NextRequest, NextResponse } from 'next/server';
import { queueStore } from '@/lib/queue-store';
import { getSocketServer } from '@/lib/socket-server';
import { QueueTicket } from '@/types/queue';

export async function GET() {
  const tickets = queueStore.getAll();
  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { type = 'online', customerName } = body as {
    type?: 'online' | 'instore';
    customerName?: string;
  };

  const ticket = queueStore.createTicket(type, customerName);

  // Broadcast queue update via Socket.io if available
  const io = getSocketServer();
  if (io) {
    io.emit('queue:update', queueStore.getAll());
  }

  return NextResponse.json(ticket, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, status } = body as { id?: string; status?: QueueTicket['status'] };

  if (!id || !status) {
    return NextResponse.json({ error: 'id and status required' }, { status: 400 });
  }

  const ticket = queueStore.updateStatus(id, status);
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const io = getSocketServer();
  if (io) {
    io.emit('queue:update', queueStore.getAll());
  }

  return NextResponse.json(ticket);
}
