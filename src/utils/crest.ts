// PRD FR-023 – SVG Loader: "Nếu thiếu Logo -> Default Logo, Không hiện Image
// Broken." Only a subset of teams ship with a real crest asset; everyone
// else falls back to the generated initials badge (badge.ts). This set is
// the single source of truth for which team ids actually have a file under
// /public/assets/crests, so we never point an <img> at something missing.
const AVAILABLE_CRESTS = new Set([
  'club-barcelona',
  'club-real-madrid',
  'club-atletico-madrid',
  'club-man-city',
  'club-man-utd',
  'club-liverpool',
  'club-chelsea',
  'club-arsenal',
  'club-tottenham',
  'club-bayern',
  'club-dortmund',
  'club-psg',
  'club-juventus',
  'club-inter',
  'club-ac-milan',
  'club-napoli',
  'nt-brazil',
  'nt-argentina',
  'nt-france',
  'nt-germany',
  'nt-spain',
  'nt-england',
  'nt-italy',
  'nt-netherlands',
  'nt-belgium',
  'nt-croatia',
  'nt-uruguay'
]);

export function crestUrlForTeam(teamId: string): string | null {
  return AVAILABLE_CRESTS.has(teamId) ? `/assets/crests/${teamId}.svg` : null;
}

export function hasCrest(teamId: string): boolean {
  return AVAILABLE_CRESTS.has(teamId);
}
