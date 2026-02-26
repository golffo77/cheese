'use client';

import { QueueTicket } from '@/types/queue';
import TicketCard from './TicketCard';

interface QueuePanelProps {
  tickets: QueueTicket[];
  onCall: (ticket: QueueTicket) => void;
  onStartVideoCall: (ticket: QueueTicket) => void;
  onDone: (ticket: QueueTicket) => void;
  activeCallTicketId: string | null;
}

export default function QueuePanel({
  tickets,
  onCall,
  onStartVideoCall,
  onDone,
  activeCallTicketId,
}: QueuePanelProps) {
  const active = tickets.filter(t => t.status !== 'done');
  const done = tickets.filter(t => t.status === 'done');
  const onlineCount = active.filter(t => t.type === 'online').length;
  const instoreCount = active.filter(t => t.type === 'instore').length;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Warteschlange</h2>
          <div className="flex gap-3 text-sm">
            {onlineCount > 0 && (
              <span className="bg-white/20 px-2.5 py-1 rounded-full">
                🌐 {onlineCount}
              </span>
            )}
            {instoreCount > 0 && (
              <span className="bg-white/20 px-2.5 py-1 rounded-full">
                🏪 {instoreCount}
              </span>
            )}
          </div>
        </div>
        <p className="text-amber-100 text-sm mt-0.5">
          {active.length} aktiv · {done.length} erledigt heute
        </p>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {active.length === 0 ? (
          <div className="text-center py-10 text-stone-400 dark:text-stone-600">
            <div className="text-4xl mb-2">🧀</div>
            <p className="font-medium">Keine Kunden in der Warteschlange</p>
          </div>
        ) : (
          active.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onCall={onCall}
              onStartVideoCall={onStartVideoCall}
              onDone={onDone}
              isActiveCall={ticket.id === activeCallTicketId}
            />
          ))
        )}

        {done.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-stone-400 dark:text-stone-600 uppercase tracking-wide font-semibold mb-2 px-1">
              Erledigt ({done.length})
            </p>
            {done.slice(-3).map(ticket => (
              <div key={ticket.id} className="opacity-40">
                <TicketCard
                  ticket={ticket}
                  onCall={onCall}
                  onStartVideoCall={onStartVideoCall}
                  onDone={onDone}
                  isActiveCall={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
