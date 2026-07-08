import { colorForTeam } from '@/utils/badge';
import type { Team, WheelSlice as WheelSliceModel } from '@/types';



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
 * so the user sees a real wheel before ever pressing Spin.
 * Displays exactly the teams in the pool in their shuffled order.
 */
export function buildIdleSlices(pool: Team[]): WheelSliceModel[] {
  if (pool.length === 0) return [];
  const shuffled = shuffle(pool);
  const sliceAngle = 360 / shuffled.length;
  return shuffled.map((team, index) => ({
    team,
    angleStart: index * sliceAngle,
    angleEnd: (index + 1) * sliceAngle,
    color: colorForTeam(team.id)
  }));
}

/**
 * Generates visual slices for the wheel during a spin.
 * Displays exactly the teams in the pool once, with the winner placed at a random position.
 */
export function generateWheelSlices(pool: Team[], winner: Team): WheelSliceModel[] {
  if (pool.length === 0) throw new Error('Cannot build a wheel from an empty pool');

  const others = pool.filter((team) => team.id !== winner.id);
  const shuffledOthers = shuffle(others);
  const winnerPosition = randomInt(0, shuffledOthers.length);
  const teamsInOrder = [
    ...shuffledOthers.slice(0, winnerPosition),
    winner,
    ...shuffledOthers.slice(winnerPosition)
  ];

  const sliceAngle = 360 / teamsInOrder.length;
  return teamsInOrder.map((team, index) => ({
    team,
    angleStart: index * sliceAngle,
    angleEnd: (index + 1) * sliceAngle,
    color: colorForTeam(team.id)
  }));
}