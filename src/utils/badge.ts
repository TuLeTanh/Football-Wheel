// Deterministic "crest" color derived from the team id, so every team keeps
// a stable, recognizable badge color across sessions without shipping any
// third-party logo artwork.
const PALETTE = [
  '#E4572E', '#35D07F', '#3FA7D6', '#FFC94D', '#B98CFF',
  '#F45B69', '#4FC1E9', '#F9A826', '#2EC4B6', '#EF476F',
  '#118AB2', '#FF6B6B', '#06D6A0', '#C77DFF', '#FFB703'
];

// PRD 3.6 – Team Dynamic Color: a handful of iconic clubs/nations get their
// real brand color so the "background tints after the win" effect reads as
// authentic for the examples the PRD calls out by name. Every other team
// (there are hundreds) still gets a stable color via the hash fallback below.
const BRAND_COLORS: Record<string, string> = {
  'club-barcelona': '#A50044',
  'club-real-madrid': '#5E2D91',
  'club-liverpool': '#C8102E',
  'club-man-city': '#6CABDD',
  'club-man-utd': '#DA291C',
  'club-chelsea': '#034694',
  'club-arsenal': '#EF0107',
  'club-tottenham': '#132257',
  'club-bayern': '#DC052D',
  'club-dortmund': '#FDE100',
  'club-juventus': '#000000',
  'club-ac-milan': '#FB090B',
  'club-inter': '#0068A8',
  'club-psg': '#004170',
  'nt-brazil': '#FFDF00',
  'nt-argentina': '#75AADB',
  'nt-germany': '#000000',
  'nt-france': '#0055A4',
  'nt-england': '#CE1124',
  'nt-spain': '#C60B1E',
  'nt-italy': '#0068A8',
  'nt-portugal': '#046A38',
  'nt-vietnam': '#DA251D'
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function colorForTeam(teamId: string): string {
  return BRAND_COLORS[teamId] ?? PALETTE[hashString(teamId) % PALETTE.length];
}

export function initialsForTeam(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}
