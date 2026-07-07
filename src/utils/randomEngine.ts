import type { Team } from '@/types';

/** Cryptographically-seeded uniform random in [0, 1). Falls back to Math.random. */
function secureRandom(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0xffffffff;
  }
  return Math.random();
}

/** Picks one team uniformly at random. Every team has exactly the same chance. */
export function pickRandomTeam(pool: Team[]): Team {
  if (pool.length === 0) throw new Error('Cannot spin an empty pool');
  const index = Math.floor(secureRandom() * pool.length);
  return pool[Math.min(index, pool.length - 1)];
}

export interface SpinTarget {
  winnerIndex: number;
  /** Final rotation in degrees the wheel element should animate to. */
  finalRotation: number;
}

/**
 * Computes how far (in degrees) the wheel must rotate so the pointer
 * (fixed at the top, 0deg) lands in the middle of the winner's slice,
 * after a number of full spins for a satisfying "acceleration -> bounce" feel.
 */
export function computeSpinTarget(
  sliceCount: number,
  winnerIndex: number,
  currentRotation: number,
  extraSpins = 6
): SpinTarget {
  const sliceAngle = 360 / sliceCount;
  const sliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
  // Wheel rotates clockwise; pointer is fixed at top (0deg / 12 o'clock).
  // To bring `sliceCenter` under the pointer we rotate the wheel by -sliceCenter.
  const targetWithinCircle = (360 - sliceCenter) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  let delta = targetWithinCircle - currentMod;
  if (delta < 0) delta += 360;
  const finalRotation = currentRotation + extraSpins * 360 + delta;
  return { winnerIndex, finalRotation };
}
