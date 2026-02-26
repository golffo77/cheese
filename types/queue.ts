export type TicketType = 'online' | 'instore';
export type TicketStatus = 'waiting' | 'called' | 'serving' | 'done';

export interface QueueTicket {
  id: string;
  number: number;
  type: TicketType;
  status: TicketStatus;
  customerName?: string;
  socketId?: string;
  joinedAt: string; // ISO string for JSON serialization
}

export interface QueueState {
  tickets: QueueTicket[];
  currentNumber: number;
  nextNumber: number;
}
