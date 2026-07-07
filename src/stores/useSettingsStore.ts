import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/utils/storage';
import type { ThemePreference } from '@/types';

export type ThemeMode = 'light' | 'dark';

interface SettingsState {
  /** User preference: 'system' follows the OS, otherwise forced. */
  theme: ThemePreference;
  /** Resolved 'light' | 'dark' the UI should render right now. */
  resolvedTheme: ThemeMode;
  language: 'en' | 'vi';
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  reduceMotion: boolean;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (lang: 'en' | 'vi') => void;
  setHapticsEnabled: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

function resolve(theme: ThemePreference): ThemeMode {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return theme;
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: resolve('system'),
      language: 'en',
      hapticsEnabled: true,
      soundEnabled: false,
      reduceMotion: prefersReducedMotion,
      setTheme: (theme) => set({ theme, resolvedTheme: resolve(theme) }),
      setLanguage: (language) => set({ language }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion })
    }),
    {
      name: 'team-wheel:settings',
      storage: createJSONStorage(() => safeStorage as unknown as Storage),
      onRehydrateStorage: () => (state) => {
        // Re-resolve 'system' against the current OS setting after reload.
        state?.setTheme(state.theme);
      }
    }
  )
);

// Live-update 'system' theme users when the OS scheme flips while the app is open.
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    const { theme, setTheme } = useSettingsStore.getState();
    if (theme === 'system') setTheme('system');
  });
}
