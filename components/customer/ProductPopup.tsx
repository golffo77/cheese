'use client';

import { Product } from '@/types/product';

interface ProductPopupProps {
  product: Product;
  onClose: () => void;
}

export default function ProductPopup({ product, onClose }: ProductPopupProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="text-amber-100 text-sm mt-1">{product.origin}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              ×
            </button>
          </div>
          <div className="mt-4 text-3xl font-bold">
            {product.currency} {product.price_per_100g.toFixed(2)}
            <span className="text-lg font-normal text-amber-100"> / 100g</span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Fettgehalt" value={product.fat} />
            <InfoCard label="Reifezeit" value={product.aging} />
            <InfoCard label="Herkunft" value={product.origin} />
            <InfoCard
              label="Preis / kg"
              value={`${product.currency} ${(product.price_per_100g * 10).toFixed(2)}`}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {product.labelKeywords.slice(0, 3).map(kw => (
              <span
                key={kw}
                className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
      <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="font-semibold text-stone-800 dark:text-stone-200">{value}</p>
    </div>
  );
}
