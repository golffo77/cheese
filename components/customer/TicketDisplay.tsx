'use client';

import { QueueTicket } from '@/types/queue';

interface TicketDisplayProps {
  ticket: QueueTicket;
  waitingAhead: number;
  onCancel: () => void;
}

const STATUS_LABELS: Record<QueueTicket['status'], string> = {
  waiting: 'Sie warten',
  called: 'Sie werden aufgerufen!',
  serving: 'Sie werden bedient',
  done: 'Erledigt',
};

const STATUS_COLORS: Record<QueueTicket['status'], string> = {
  waiting: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
  called: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700 animate-pulse',
  serving: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700',
  done: 'bg-stone-50 border-stone-200 dark:bg-stone-800 dark:border-stone-700',
};

export default function TicketDisplay({ ticket, waitingAhead, onCancel }: TicketDisplayProps) {
  return (
    <div className={`rounded-2xl border-2 shadow-lg p-6 ${STATUS_COLORS[ticket.status]}`}>
      {/* Ticket number */}
      <div className="text-center mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">
          Ihre Wartennummer
        </p>
        <div className="text-7xl font-black text-amber-500 leading-none">
          {ticket.number}
        </div>
      </div>

      {/* Status */}
      <div className="text-center mb-4">
        <span className="inline-block bg-white dark:bg-stone-800 shadow-sm text-stone-700 dark:text-stone-300 font-semibold text-sm px-4 py-1.5 rounded-full">
          {STATUS_LABELS[ticket.status]}
        </span>
      </div>

      {/* Waiting info */}
      {ticket.status === 'waiting' && (
        <p className="text-center text-sm text-stone-600 dark:text-stone-400 mb-4">
          {waitingAhead === 0
            ? 'Sie sind als nächstes dran!'
            : `Noch ${waitingAhead} Person${waitingAhead !== 1 ? 'en'  : ''} vor Ihnen`}
        </p>
      )}

      {/* Called state */}
      {ticket.status === 'called' && (
        <div className="text-center text-green-700 dark:text-green-400 font-semibold text-sm mb-4 animate-bounce">
          Bitte warten Sie auf den Videoanruf!
        </div>
      )}

      {/* Ticket meta */}
      <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500 border-t border-current/10 pt-3">
        <span>#{ticket.id.slice(-8)}</span>
        <span>{new Date(ticket.joinedAt).toLocaleTimeString('de-CH')}</span>
      </div>

      {ticket.status === 'waiting' && (
        <button
          onClick={onCancel}
          className="mt-4 w-full text-sm text-stone-500 hover:text-red-600 dark:hover:text-red-400 transition-colors py-2"
        >
          Nummer zurückgeben
        </button>
      )}
    </div>
  );
}
