import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import WheelSlice from './WheelSlice';
import type { WheelSlice as WheelSliceModel } from '@/types';

interface WheelCanvasProps {
  slices: WheelSliceModel[];
  rotation: number;
  spinning: boolean;
  reduceMotion?: boolean;
  onSpinComplete?: () => void;
  size?: number;
}

// PRD 3.22 – Wheel Timeline: Tap(0) -> Scale(100) -> Acceleration(200) ->
// MaxSpeed(600) -> ConstantSpeed(1800) -> SlowDown(2600) -> Bounce(3300) ->
// Winner(3500)ms. We reproduce this as a multi-segment keyframe animation on
// `rotate` instead of one flat tween, so the wheel visibly speeds up, cruises,
// slows down and settles with a tiny overshoot bounce — "phải giống wheel
// thật, không giống PowerPoint".
const TIMELINE_MS = [0, 100, 200, 600, 1800, 2600, 3300, 3500];
const TIMELINE_PROGRESS = [0, 0, 0.01, 0.22, 0.62, 0.86, 1.03, 1];
const TIMELINE_EASE = ['linear', 'easeIn', 'easeIn', 'linear', 'easeOut', 'easeOut', 'easeInOut'] as const;
const TOTAL_DURATION = TIMELINE_MS[TIMELINE_MS.length - 1] / 1000;

/**
 * PRD 3.17 – Wheel Design: SVG wheel (no Canvas), fixed pointer, 12px border,
 * center circle with app logo, rotates a full 360deg per lap.
 * PRD 3.20/3.21 – spin duration 3200~3800ms, Ease Out Quint (approximated by
 * the per-segment ease curve above), pointer ticks gently while spinning.
 * PRD FR-033 – Reduce Motion: collapse to a short, direct tween that still
 * lands on the exact winner, no bounce/bells.
 */
export default function WheelCanvas({
  slices,
  rotation,
  spinning,
  reduceMotion = false,
  onSpinComplete,
  size = 320
}: WheelCanvasProps) {
  const center = size / 2;
  const borderWidth = 12;
  const radius = center - borderWidth;
  const lastRotationRef = useRef(0);

  const keyframes = reduceMotion
    ? rotation
    : [null, ...TIMELINE_PROGRESS.slice(1).map((p) => lastRotationRef.current + p * (rotation - lastRotationRef.current))];
  const times = reduceMotion ? undefined : TIMELINE_MS.map((ms) => ms / TIMELINE_MS[TIMELINE_MS.length - 1]);

  return (
    <div className="wheelStage" style={{ width: size, height: size }}>
      <div className={spinning && !reduceMotion ? 'wheelPointer spinning' : 'wheelPointer'} aria-hidden="true" />
      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="wheelSvg"
        animate={{ rotate: keyframes as number[] }}
        transition={
          spinning
            ? reduceMotion
              ? { duration: 1, ease: 'easeOut' }
              : { duration: TOTAL_DURATION, times, ease: TIMELINE_EASE as unknown as string[] }
            : { duration: 0 }
        }
        onAnimationComplete={() => {
          if (spinning) {
            lastRotationRef.current = rotation;
            onSpinComplete?.();
          }
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
          <WheelSlice
            key={`${slice.team.id}-${index}`}
            slice={slice}
            radius={radius}
            center={center}
            sliceKey={`${slice.team.id}-${index}`}
          />
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
