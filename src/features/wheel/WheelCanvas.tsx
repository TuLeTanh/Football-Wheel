import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import WheelSlice from './WheelSlice';
import type { WheelSlice as WheelSliceModel } from '@/types';

interface WheelCanvasProps {
  slices: WheelSliceModel[];
  rotation: number;
  spinning: boolean;
  onSpinComplete?: () => void;
  size?: number;
}

/**
 * PRD 3.17 – Wheel Design: SVG wheel (no Canvas), fixed pointer, 12px border,
 * center circle with app logo, rotates a full 360deg per lap.
 * PRD 3.20 – spin duration 3200~3800ms, accel -> constant -> decel -> bounce.
 */
export default function WheelCanvas({ slices, rotation, spinning, onSpinComplete, size = 320 }: WheelCanvasProps) {
  const center = size / 2;
  const borderWidth = 12;
  const radius = center - borderWidth;

  return (
    <div className="wheelStage" style={{ width: size, height: size }}>
      <div className="wheelPointer" aria-hidden="true" />
      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="wheelSvg"
        animate={{ rotate: rotation }}
        transition={
          spinning
            ? { duration: 3.5, ease: [0.17, 0.67, 0.16, 0.99] }
            : { duration: 0 }
        }
        onAnimationComplete={() => {
          if (spinning) onSpinComplete?.();
        }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          style={{ fill: 'var(--card)', stroke: 'var(--card)' }}
          strokeWidth={borderWidth}
        />
        {slices.map((slice, index) => (
          <WheelSlice key={`${slice.team.id}-${index}`} slice={slice} radius={radius} center={center} />
        ))}
        <circle
          cx={center}
          cy={center}
          r={radius * 0.16}
          style={{ fill: 'var(--card)', stroke: 'var(--color-primary)' }}
          strokeWidth={3}
        />
      </motion.svg>
      <div className="wheelHub" aria-hidden="true">
        <Shuffle size={size * 0.06} style={{ color: 'var(--color-primary)' }} />
      </div>
    </div>
  );
}