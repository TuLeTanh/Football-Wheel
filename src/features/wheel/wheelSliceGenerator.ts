import { colorForTeam } from '@/utils/badge';
import type { Team, WheelSlice as WheelSliceModel } from '@/types';

const MIN_SLICES = 30;
const MAX_SLICES = 40;

/** Cryptographically-seeded uniform random in [0, 1). Falls back to Math.random. */
function secureRandom(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0xffffffff;
  }
  return Math.random();
}

function randomInt(min: number, max: number): number {
  return Math.floor(secureRandom() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Builds a static preview wheel (no winner logic) from the current pool,
 * so the user sees a real wheel before ever pressing Spin. Cycles teams
 * to keep the same 30-40 slice density even if the pool is small.
 */
export function buildIdleSlices(pool: Team[]): WheelSliceModel[] {
  if (pool.length === 0) return [];
  const sliceCount = Math.min(MAX_SLICES, Math.max(MIN_SLICES, pool.length));
  const shuffled = shuffle(pool);
  const teamsInOrder = Array.from({ length: sliceCount }, (_, i) => shuffled[i % shuffled.length]);
  const sliceAngle = 360 / teamsInOrder.length;
  return teamsInOrder.map((team, index) => ({
    team,
    angleStart: index * sliceAngle,
    angleEnd: (index + 1) * sliceAngle,
    color: colorForTeam(team.id)
  }));
}

/**
 * PRD 3.18 – Wheel Slice:
 * The winner is decided FIRST (via pickRandomTeam), then we generate
 * 30-40 visual slices with the winner placed at exactly one random slice.
 * This keeps the wheel "fair looking" (many teams visible) while the
 * underlying result was already determined for a nice animation.
 *
 * - If the pool is small, teams repeat (padded) to fill 30-40 slices.
 * - If the pool is large, only a random subset + the winner is shown,
 *   so every spin still feels varied.
 */
export function generateWheelSlices(pool: Team[], winner: Team): WheelSliceModel[] {
  if (pool.length === 0) throw new Error('Cannot build a wheel from an empty pool');

  const sliceCount = randomInt(MIN_SLICES, MAX_SLICES);
  const others = pool.filter((team) => team.id !== winner.id);

  const filler: Team[] = [];
  if (others.length === 0) {
    // Only one team in the pool: fill the rest of the wheel with it too.
    for (let i = 0; i < sliceCount - 1; i++) filler.push(winner);
  } else if (others.length >= sliceCount - 1) {
    filler.push(...shuffle(others).slice(0, sliceCount - 1));
  } else {
    // Not enough distinct teams: cycle through the shuffled pool repeatedly.
    const shuffled = shuffle(others);
    for (let i = 0; i < sliceCount - 1; i++) {
      filler.push(shuffled[i % shuffled.length]);
    }
  }

  const shuffledFiller = shuffle(filler);
  const winnerPosition = randomInt(0, shuffledFiller.length);
  const teamsInOrder = [
    ...shuffledFiller.slice(0, winnerPosition),
    winner,
    ...shuffledFiller.slice(winnerPosition)
  ];

  const sliceAngle = 360 / teamsInOrder.length;
  return teamsInOrder.map((team, index) => ({
    team,
    angleStart: index * sliceAngle,
    angleEnd: (index + 1) * sliceAngle,
    color: colorForTeam(team.id)
  }));
}