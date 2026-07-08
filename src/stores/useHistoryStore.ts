import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/utils/storage';
import type { CategoryId, SpinResult } from '@/types';

// PRD 8 – History Screen: keep at most the 50 most recent draws;
// the oldest entry is dropped once the cap is exceeded.
const MAX_HISTORY = 50;

interface HistoryState {
  results: SpinResult[];
  addResult: (result: Omit<SpinResult, 'id' | 'timestamp'>) => SpinResult;
  deleteResult: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      results: [],
      addResult: (result) => {
        const entry: SpinResult = {
          ...result,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now()
        };
        set((s) => ({ results: [entry, ...s.results].slice(0, MAX_HISTORY) }));
        return entry;
      },
      deleteResult: (id) => set((s) => ({ results: s.results.filter((r) => r.id !== id) })),
      clearHistory: () => set({ results: [] })
    }),
    {
      name: 'team-wheel:history',
      storage: createJSONStorage(() => safeStorage as unknown as Storage)
    }
  )
);

export function groupHistoryByDay(results: SpinResult[]) {
  const groups: { key: string; label: 'today' | 'yesterday' | 'date'; date?: string; items: SpinResult[] }[] = [];
  const startOfDay = (ts: number) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const today = startOfDay(Date.now());
  const yesterday = today - 86400000;

  for (const item of results) {
    const day = startOfDay(item.timestamp);
    const key = String(day);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = {
        key,
        label: day === today ? 'today' : day === yesterday ? 'yesterday' : 'date',
        date: new Date(day).toLocaleDateString(),
        items: []
      };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

export function filterByCategory(results: SpinResult[], category: CategoryId | 'all') {
  return category === 'all' ? results : results.filter((r) => r.category === category);
}
