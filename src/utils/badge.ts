// Deterministic "crest" color derived from the team id, so every team keeps
// a stable, recognizable badge color across sessions without shipping any
// third-party logo artwork.
const PALETTE = [
  '#E4572E', '#35D07F', '#3FA7D6', '#FFC94D', '#B98CFF',
  '#F45B69', '#4FC1E9', '#F9A826', '#2EC4B6', '#EF476F',
  '#118AB2', '#FF6B6B', '#06D6A0', '#C77DFF', '#FFB703'
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function colorForTeam(teamId: string): string {
  return PALETTE[hashString(teamId) % PALETTE.length];
}

export function initialsForTeam(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}
