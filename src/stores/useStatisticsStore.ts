import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/utils/storage';
import type { CategoryId } from '@/types';

// PRD 9 – Statistics Screen: counts survive independently of History (which
// caps at 50 entries) so "most drawn" stays accurate over the long run.
// Resetting Statistics does NOT clear History, and vice versa.
interface CountEntry {
  teamId: string;
  category: CategoryId;
  count: number;
}

interface StatisticsState {
  totalSpins: number;
  counts: Record<string, CountEntry>;
  recordSpin: (category: CategoryId, teamId: string) => void;
  resetStatistics: () => void;
}

function key(category: CategoryId, teamId: string) {
  return `${category}:${teamId}`;
}

export const useStatisticsStore = create<StatisticsState>()(
  persist(
    (set) => ({
      totalSpins: 0,
      counts: {},
      recordSpin: (category, teamId) =>
        set((s) => {
          const k = key(category, teamId);
          const existing = s.counts[k];
          return {
            totalSpins: s.totalSpins + 1,
            counts: {
              ...s.counts,
              [k]: { teamId, category, count: (existing?.count ?? 0) + 1 }
            }
          };
        }),
      resetStatistics: () => set({ totalSpins: 0, counts: {} })
    }),
    {
      name: 'team-wheel:statistics',
      storage: createJSONStorage(() => safeStorage as unknown as Storage)
    }
  )
);
