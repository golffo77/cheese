'use client';

import { useState } from 'react';

interface PaymentFlowProps {
  ticketId: string;
  ticketNumber: number;
  onComplete: (method: 'pickup' | 'delivery', address?: string) => void;
  onClose: () => void;
}

export default function PaymentFlow({ ticketId, ticketNumber, onComplete, onClose }: PaymentFlowProps) {
  const [method, setMethod] = useState<'pickup' | 'delivery' | null>(null);
  const [address, setAddress] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!method) return;
    if (method === 'delivery' && !address.trim()) return;
    onComplete(method, method === 'delivery' ? address.trim() : undefined);
    setConfirmed(true);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {confirmed ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">
              Bestellung bestätigt!
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              {method === 'pickup'
                ? 'Ihre Bestellung liegt zur Abholung bereit.'
                : `Ihre Bestellung wird geliefert an: ${address}`}
            </p>
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Fertig
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
              <h2 className="text-xl font-bold">Bestellung abschliessen</h2>
              <p className="text-amber-100 text-sm mt-1">Ticket #{ticketNumber}</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-stone-700 dark:text-stone-300 font-medium">
                Wie möchten Sie Ihren Käse erhalten?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod('pickup')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    method === 'pickup'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-stone-200 dark:border-stone-700 hover:border-amber-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🏪</div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm">Abholung</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Im Geschäft</p>
                </button>

                <button
                  onClick={() => setMethod('delivery')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    method === 'delivery'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-stone-200 dark:border-stone-700 hover:border-amber-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🚚</div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm">Lieferung</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">An Ihre Adresse</p>
                </button>
              </div>

              {method === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Lieferadresse
                  </label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Strasse, PLZ Ort"
                    rows={3}
                    className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 font-medium py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!method || (method === 'delivery' && !address.trim())}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Bestätigen
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
