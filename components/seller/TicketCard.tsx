'use client';

import { QueueTicket } from '@/types/queue';

interface TicketCardProps {
  ticket: QueueTicket;
  onCall: (ticket: QueueTicket) => void;
  onStartVideoCall: (ticket: QueueTicket) => void;
  onDone: (ticket: QueueTicket) => void;
  isActiveCall: boolean;
}

const STATUS_BADGE: Record<QueueTicket['status'], { label: string; className: string }> = {
  waiting: { label: 'Wartend', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  called: { label: 'Aufgerufen', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  serving: { label: 'In Beratung', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  done: { label: 'Erledigt', className: 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400' },
};

export default function TicketCard({ ticket, onCall, onStartVideoCall, onDone, isActiveCall }: TicketCardProps) {
  const badge = STATUS_BADGE[ticket.status];
  const waitTime = Math.floor((Date.now() - new Date(ticket.joinedAt).getTime()) / 60000);

  return (
    <div className={`bg-white dark:bg-stone-800 rounded-xl border shadow-sm p-4 transition-all ${
      isActiveCall ? 'border-green-400 ring-2 ring-green-300' : 'border-stone-200 dark:border-stone-700'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black text-amber-500">{ticket.number}</div>
          <div>
            <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
              {ticket.customerName ?? 'Anonym'}
            </p>
            <p className="text-xs text-stone-400">
              {ticket.type === 'online' ? '🌐 Online' : '🏪 Vor Ort'} · {waitTime}min
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {ticket.status === 'waiting' && (
          <button
            onClick={() => onCall(ticket)}
            className="flex-1 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            📣 Aufrufen
          </button>
        )}
        {(ticket.status === 'waiting' || ticket.status === 'called') && ticket.socketId && (
          <button
            onClick={() => onStartVideoCall(ticket)}
            disabled={isActiveCall}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            📹 Anrufen
          </button>
        )}
        {(ticket.status !== 'done') && (
          <button
            onClick={() => onDone(ticket)}
            className="bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );
}
