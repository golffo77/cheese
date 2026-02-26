'use client';

import { useState } from 'react';
import { QueueTicket } from '@/types/queue';

interface QueueWidgetProps {
  onDraw: (name?: string) => Promise<QueueTicket | null>;
  isLoading: boolean;
  error: string | null;
  queueLength: number;
}

export default function QueueWidget({ onDraw, isLoading, error, queueLength }: QueueWidgetProps) {
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleDraw = async () => {
    await onDraw(name.trim() || undefined);
    setShowNameInput(false);
    setName('');
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6 border border-amber-100 dark:border-stone-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-xl">
          🎫
        </div>
        <div>
          <h3 className="font-bold text-stone-800 dark:text-stone-200">Virtuelle Warteschlange</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {queueLength > 0 ? `${queueLength} Person${queueLength !== 1 ? 'en' : ''} warten` : 'Keine Wartezeit'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showNameInput && (
        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ihr Name (optional)"
            className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            onKeyDown={e => e.key === 'Enter' && handleDraw()}
            autoFocus
          />
        </div>
      )}

      <div className="flex gap-2">
        {!showNameInput ? (
          <button
            onClick={() => setShowNameInput(true)}
            disabled={isLoading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '🎫 Nummer ziehen'
            )}
          </button>
        ) : (
          <>
            <button
              onClick={handleDraw}
              disabled={isLoading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              {isLoading ? 'Wird gezogen...' : 'Bestätigen'}
            </button>
            <button
              onClick={() => setShowNameInput(false)}
              className="px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Abbrechen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
