import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/utils/storage';
import type { CategoryId } from '@/types';
import { getAllTeams } from '@/data';

interface SelectionState {
  /** Selected (checked) team ids, per category. Defaults to "all teams". */
  selected: Record<CategoryId, string[]>;
  /** Team ids that have been won and locked out of future spins, per category. */
  locked: Record<CategoryId, string[]>;
  toggleTeam: (category: CategoryId, teamId: string) => void;
  selectAll: (category: CategoryId) => void;
  clearAll: (category: CategoryId) => void;
  isSelected: (category: CategoryId, teamId: string) => boolean;
  lockTeam: (category: CategoryId, teamId: string) => void;
  unlockTeam: (category: CategoryId, teamId: string) => void;
  unlockAll: (category: CategoryId) => void;
  getPool: (category: CategoryId) => string[];
}

function allIds(category: CategoryId): string[] {
  return getAllTeams(category).map((t) => t.id);
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      selected: { club: allIds('club'), national: allIds('national'), legend: allIds('legend') },
      locked: { club: [], national: [], legend: [] },
      toggleTeam: (category, teamId) =>
        set((s) => {
          const current = s.selected[category];
          const next = current.includes(teamId)
            ? current.filter((id) => id !== teamId)
            : [...current, teamId];
          return { selected: { ...s.selected, [category]: next } };
        }),
      selectAll: (category) =>
        set((s) => ({ selected: { ...s.selected, [category]: allIds(category) } })),
      clearAll: (category) => set((s) => ({ selected: { ...s.selected, [category]: [] } })),
      isSelected: (category, teamId) => get().selected[category].includes(teamId),
      lockTeam: (category, teamId) =>
        set((s) => ({
          locked: { ...s.locked, [category]: [...new Set([...s.locked[category], teamId])] }
        })),
      unlockTeam: (category, teamId) =>
        set((s) => ({
          locked: { ...s.locked, [category]: s.locked[category].filter((id) => id !== teamId) }
        })),
      unlockAll: (category) => set((s) => ({ locked: { ...s.locked, [category]: [] } })),
      getPool: (category) => {
        const { selected, locked } = get();
        return selected[category].filter((id) => !locked[category].includes(id));
      }
    }),
    {
      name: 'team-wheel:selection',
      storage: createJSONStorage(() => safeStorage as unknown as Storage)
    }
  )
);
