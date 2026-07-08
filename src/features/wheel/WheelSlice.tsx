import { useTranslation } from 'react-i18next';
import { initialsForTeam, shortNameForTeam, translateRegion } from '@/utils/badge';
import { crestUrlForTeam } from '@/utils/crest';
import type { WheelSlice as WheelSliceModel } from '@/types';

interface WheelSliceProps {
  slice: WheelSliceModel;
  radius: number;
  center: number;
  sliceKey: string;
  index?: number;
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

const PINK_COLORS = ['#D12255', '#E83665', '#F05B85'];

export default function WheelSlice({ slice, radius, center, sliceKey, index }: WheelSliceProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const midAngle = (slice.angleStart + slice.angleEnd) / 2;
  const path = describeSlicePath(center, radius, slice.angleStart, slice.angleEnd);

  const isLowerHalf = midAngle > 90 && midAngle < 270;
  const labelRotation = isLowerHalf ? midAngle + 180 : midAngle;

  const logoRadius = radius * 0.84;
  const textRadius = radius * 0.55;
  const iconRadius = radius * 0.052;
  const crestUrl = crestUrlForTeam(slice.team.id);

  // Alternating shades of pink-red to match the design reference
  const sliceColor = index !== undefined ? PINK_COLORS[index % PINK_COLORS.length] : slice.color;

  const name = shortNameForTeam(slice.team.name);
  const region = slice.team.region ? translateRegion(slice.team.region, lang) : undefined;
  const labelText = (slice.team.category === 'club' && region) ? `${name} / ${region}` : name;

  const yLogo = isLowerHalf ? center + logoRadius : center - logoRadius;
  const yText = isLowerHalf ? center + textRadius : center - textRadius;
  const textRot = isLowerHalf ? 90 : -90;

  return (
    <g>
      <path d={path} fill={sliceColor} stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1} />
      <g transform={`rotate(${labelRotation} ${center} ${center})`}>
        {/* White circle background container for the logo, preventing distortion */}
        <circle
          cx={center}
          cy={yLogo}
          r={iconRadius}
          fill="#ffffff"
          stroke="rgba(0, 0, 0, 0.12)"
          strokeWidth={0.75}
        />
        {crestUrl ? (
          <image
            href={crestUrl}
            x={center - iconRadius * 0.7}
            y={yLogo - iconRadius * 0.7}
            width={iconRadius * 1.4}
            height={iconRadius * 1.4}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          <text
            x={center}
            y={yLogo}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={sliceColor}
            fontSize={iconRadius * 0.75}
            fontWeight={900}
            style={{ userSelect: 'none' }}
          >
            {slice.team.code || initialsForTeam(slice.team.name)}
          </text>
        )}

        {/* Text Label next to the logo container */}
        <text
          x={center}
          y={yText}
          transform={`rotate(${textRot} ${center} ${yText})`}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={radius * 0.044}
          fontWeight={700}
          letterSpacing="0.02em"
          style={{ userSelect: 'none', fontFamily: 'Outfit, sans-serif' }}
        >
          {labelText}
        </text>
      </g>
    </g>
  );
}

