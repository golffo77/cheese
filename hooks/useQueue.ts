'use client';

import { useState, useCallback } from 'react';
import { QueueTicket } from '@/types/queue';

interface UseQueueReturn {
  myTicket: QueueTicket | null;
  isLoading: boolean;
  error: string | null;
  drawNumber: (customerName?: string) => Promise<QueueTicket | null>;
  clearTicket: () => void;
}

export function useQueue(): UseQueueReturn {
  const [myTicket, setMyTicket] = useState<QueueTicket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const drawNumber = useCallback(async (customerName?: string): Promise<QueueTicket | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'online', customerName }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ticket: QueueTicket = await res.json();
      setMyTicket(ticket);
      return ticket;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fehler beim Ziehen der Nummer';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearTicket = useCallback(() => {
    setMyTicket(null);
    setError(null);
  }, []);

  return { myTicket, isLoading, error, drawNumber, clearTicket };
}
