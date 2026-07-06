import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/utils/storage';

export type ThemeMode = 'light' | 'dark';

interface SettingsState {
  theme: ThemeMode;
  language: 'en' | 'vi';
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (lang: 'en' | 'vi') => void;
  setHapticsEnabled: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
}

const prefersDark =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: prefersDark === false ? 'light' : 'dark',
      language: 'en',
      hapticsEnabled: true,
      reduceMotion: prefersReducedMotion,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (language) => set({ language }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion })
    }),
    {
      name: 'team-wheel:settings',
      storage: createJSONStorage(() => safeStorage as unknown as Storage)
    }
  )
);
