import { initialsForTeam } from '@/utils/badge';
import type { WheelSlice as WheelSliceModel } from '@/types';

interface WheelSliceProps {
  slice: WheelSliceModel;
  radius: number;
  center: number;
}

function polarToCartesian(center: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(angleRad),
    y: center + radius * Math.sin(angleRad)
  };
}

function describeSlicePath(center: number, radius: number, angleStart: number, angleEnd: number) {
  const start = polarToCartesian(center, radius, angleEnd);
  const end = polarToCartesian(center, radius, angleStart);
  const largeArcFlag = angleEnd - angleStart > 180 ? 1 : 0;
  return [
    `M ${center} ${center}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z'
  ].join(' ');
}

export default function WheelSlice({ slice, radius, center }: WheelSliceProps) {
  const midAngle = (slice.angleStart + slice.angleEnd) / 2;
  const path = describeSlicePath(center, radius, slice.angleStart, slice.angleEnd);

  // Label sits along the slice's radial line. If the mid-angle falls in the
  // lower half of the wheel, flip it 180deg so it never renders upside-down
  // (PRD 3.17: "Text luon nam ngang. Khong bi xoay nguoc").
  const isLowerHalf = midAngle > 90 && midAngle < 270;
  const labelRotation = isLowerHalf ? midAngle + 180 : midAngle;
  const labelRadius = radius * 0.62;

  return (
    <g>
      <path d={path} fill={slice.color} stroke="rgba(8, 13, 16, 0.55)" strokeWidth={1.5} />
      <g transform={`rotate(${labelRotation} ${center} ${center})`}>
        <text
          x={center}
          y={center - labelRadius}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#0b1210"
          fontSize={radius * 0.09}
          fontWeight={900}
          style={{ userSelect: 'none' }}
        >
          {slice.team.code || initialsForTeam(slice.team.name)}
        </text>
      </g>
    </g>
  );
}