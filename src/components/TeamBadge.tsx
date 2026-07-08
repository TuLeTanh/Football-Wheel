import { useState } from 'react';
import { colorForTeam, initialsForTeam } from '@/utils/badge';
import { crestUrlForTeam } from '@/utils/crest';

interface TeamBadgeProps {
  teamId: string;
  name: string;
  code?: string;
  size?: 'default' | 'large';
}

/**
 * PRD FR-023 – SVG Loader: real crest art when we have it, otherwise the
 * generated color+initials badge. If the image itself fails to load for any
 * reason we fall back live rather than showing a broken-image icon.
 */
export default function TeamBadge({ teamId, name, code, size = 'default' }: TeamBadgeProps) {
  const [broken, setBroken] = useState(false);
  const crestUrl = crestUrlForTeam(teamId);
  const className = `badge${size === 'large' ? ' badgeLarge' : ''}`;

  if (crestUrl && !broken) {
    return (
      <span className={`${className} badgeImage`} aria-hidden="true">
        <img src={crestUrl} alt="" draggable={false} onError={() => setBroken(true)} />
      </span>
    );
  }

  return (
    <span className={className} style={{ backgroundColor: colorForTeam(teamId) }} aria-hidden="true">
      {code || initialsForTeam(name)}
    </span>
  );
}
