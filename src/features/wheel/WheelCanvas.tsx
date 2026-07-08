import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
// slows down and settles with a tiny overshoot bounce.
const TIMELINE_MS = [0, 100, 200, 600, 1800, 2600, 3300, 3500];
const TIMELINE_PROGRESS = [0, 0, 0.01, 0.22, 0.62, 0.86, 1.03, 1];
const TIMELINE_EASE = ['linear', 'easeIn', 'easeIn', 'linear', 'easeOut', 'easeOut', 'easeInOut'] as const;
const TOTAL_DURATION = TIMELINE_MS[TIMELINE_MS.length - 1] / 1000;

export default function WheelCanvas({
  slices,
  rotation,
  spinning,
  reduceMotion = false,
  onSpinComplete,
  size = 320
}: WheelCanvasProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const center = size / 2;
  const borderWidth = 12;
  const radius = center - borderWidth;
  const lastRotationRef = useRef(0);

  const keyframes = reduceMotion
    ? rotation
    : [null, ...TIMELINE_PROGRESS.slice(1).map((p) => lastRotationRef.current + p * (rotation - lastRotationRef.current))];
  const times = reduceMotion ? undefined : TIMELINE_MS.map((ms) => ms / TIMELINE_MS[TIMELINE_MS.length - 1]);

  // Generate 60 scallop circles to decorate the outer rim of the wheel (spins with it)
  const scallops = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i * 360) / 60;
    const angleRad = (angle * Math.PI) / 180;
    const cx = center + (radius + 2) * Math.cos(angleRad);
    const cy = center + (radius + 2) * Math.sin(angleRad);
    return { cx, cy };
  });

  return (
    <div className="wheelStage" style={{ width: size, height: size }}>
      {/* Pointer is positioned on the LEFT side of the wheel pointing right */}
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
        {/* Outer Wheel Rim */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          style={{ fill: '#ffffff', stroke: '#ffffff' }}
          strokeWidth={borderWidth}
        />

        {/* Wheel Slices */}
        {slices.map((slice, index) => (
          <WheelSlice
            key={`${slice.team.id}-${index}`}
            slice={slice}
            radius={radius}
            center={center}
            sliceKey={`${slice.team.id}-${index}`}
            index={index}
          />
        ))}

        {/* Scallop edge decoration */}
        {scallops.map((sc, i) => (
          <circle
            key={`scallop-${i}`}
            cx={sc.cx}
            cy={sc.cy}
            r={radius * 0.038}
            fill="#ffffff"
            stroke="rgba(0, 0, 0, 0.05)"
            strokeWidth={0.5}
          />
        ))}

        {/* Center hub styled after the design */}
        <circle
          cx={center}
          cy={center}
          r={radius * 0.32}
          fill="#8b1c3b"
          stroke="#ffffff"
          strokeWidth={2.5}
          style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.25))' }}
        />

        {/* Multi-line text inside center hub */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={radius * 0.075}
          fontWeight={800}
          style={{ userSelect: 'none', fontFamily: 'Outfit, sans-serif' }}
        >
          {lang.startsWith('vi') ? (
            <>
              <tspan x={center} y={center} dy="-1.35em">Ơ Mây</tspan>
              <tspan x={center} y={center} dy="-0.15em">Zing</tspan>
              <tspan x={center} y={center} dy="1.05em">! Gút</tspan>
              <tspan x={center} y={center} dy="2.25em">Chóp</tspan>
            </>
          ) : (
            <>
              <tspan x={center} y={center} dy="-1.35em">Amazing</tspan>
              <tspan x={center} y={center} dy="-0.15em">!</tspan>
              <tspan x={center} y={center} dy="1.05em">Good</tspan>
              <tspan x={center} y={center} dy="2.25em">Job</tspan>
            </>
          )}
        </text>
      </motion.svg>
    </div>
  );
}

