import { QueueTicket, TicketStatus } from '@/types/queue';

class QueueStore {
  private tickets: Map<string, QueueTicket> = new Map();
  private counter = 0;

  createTicket(type: 'online' | 'instore', customerName?: string, socketId?: string): QueueTicket {
    this.counter++;
    const ticket: QueueTicket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      number: this.counter,
      type,
      status: 'waiting',
      customerName,
      socketId,
      joinedAt: new Date().toISOString(),
    };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  getAll(): QueueTicket[] {
    return Array.from(this.tickets.values()).sort(
      (a, b) => a.number - b.number
    );
  }

  getWaiting(): QueueTicket[] {
    return this.getAll().filter(t => t.status === 'waiting' || t.status === 'called');
  }

  updateStatus(id: string, status: TicketStatus): QueueTicket | null {
    const ticket = this.tickets.get(id);
    if (!ticket) return null;
    ticket.status = status;
    this.tickets.set(id, ticket);
    return ticket;
  }

  updateSocketId(id: string, socketId: string): void {
    const ticket = this.tickets.get(id);
    if (ticket) {
      ticket.socketId = socketId;
      this.tickets.set(id, ticket);
    }
  }

  getById(id: string): QueueTicket | null {
    return this.tickets.get(id) ?? null;
  }

  getNextNumber(): number {
    return this.counter + 1;
  }

  reset(): void {
    this.tickets.clear();
    this.counter = 0;
  }
}

// Singleton – persists across hot-reloads via globalThis
declare global {
  // eslint-disable-next-line no-var
  var __queueStore: QueueStore | undefined;
}

export const queueStore: QueueStore =
  globalThis.__queueStore ?? (globalThis.__queueStore = new QueueStore());
