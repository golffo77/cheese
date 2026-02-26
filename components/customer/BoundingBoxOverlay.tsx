'use client';

import { Detection } from '@/types/detection';

interface BoundingBoxOverlayProps {
  detections: Detection[];
  onBoxClick: (detection: Detection) => void;
}

export default function BoundingBoxOverlay({ detections, onBoxClick }: BoundingBoxOverlayProps) {
  if (detections.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
    >
      {detections.map((det, i) => {
        const [x1, y1, x2, y2] = det.bbox;
        const w = x2 - x1;
        const h = y2 - y1;
        const hasProduct = !!det.product_id;

        return (
          <g key={i}>
            {/* Bounding box rectangle */}
            <rect
              x={x1}
              y={y1}
              width={w}
              height={h}
              fill={hasProduct ? 'rgba(251, 191, 36, 0.15)' : 'rgba(156, 163, 175, 0.15)'}
              stroke={hasProduct ? '#f59e0b' : '#9ca3af'}
              strokeWidth="0.003"
              rx="0.005"
              className={hasProduct ? 'cursor-pointer pointer-events-auto' : ''}
              onClick={() => hasProduct && onBoxClick(det)}
            />

            {/* Confidence badge */}
            <rect
              x={x1}
              y={y1 - 0.035}
              width={Math.min(w, 0.25)}
              height={0.03}
              fill={hasProduct ? '#f59e0b' : '#374151'}
              rx="0.004"
            />
            <text
              x={x1 + 0.006}
              y={y1 - 0.012}
              fontSize="0.022"
              fill="black"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {det.label_text
                ? det.label_text.slice(0, 14)
                : `${(det.confidence * 100).toFixed(0)}%`}
            </text>

            {/* Click hint for identified products */}
            {hasProduct && (
              <text
                x={x1 + w / 2}
                y={y2 + 0.03}
                fontSize="0.02"
                fill="#f59e0b"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                Klicken
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
