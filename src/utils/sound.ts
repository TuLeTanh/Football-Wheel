import { useSettingsStore } from '@/stores/useSettingsStore';

type SoundName = 'spin' | 'winner' | 'click' | 'lock' | 'bgm';

const cache = new Map<SoundName, HTMLAudioElement>();
let bgmAudio: HTMLAudioElement | null = null;

export function playSound(name: SoundName): void {
  if (!useSettingsStore.getState().soundEnabled) return;

  let audio = cache.get(name);
  if (!audio) {
    audio = new Audio(`/assets/sounds/${name}.wav`);
    cache.set(name, audio);
  }
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Fail silently if not loaded
  });
}

export function playBGM(): void {
  if (!useSettingsStore.getState().soundEnabled) return;
  if (!bgmAudio) {
    bgmAudio = new Audio('/assets/sounds/bgm.wav');
    bgmAudio.loop = true;
    bgmAudio.volume = 0.28; // Comfortable BGM level
  }
  bgmAudio.play().catch(() => {});
}

export function stopBGM(): void {
  if (bgmAudio) {
    bgmAudio.pause();
  }
}

// Sync BGM with settings toggle state dynamically
useSettingsStore.subscribe((state) => {
  if (state.soundEnabled) {
    playBGM();
  } else {
    stopBGM();
  }
});

// Auto-start BGM on first user interaction if sound is enabled (bypass autoplay blocker)
if (typeof window !== 'undefined') {
  const startOnInteraction = () => {
    if (useSettingsStore.getState().soundEnabled) {
      playBGM();
    }
    window.removeEventListener('click', startOnInteraction);
    window.removeEventListener('touchstart', startOnInteraction);
  };
  window.addEventListener('click', startOnInteraction);
  window.addEventListener('touchstart', startOnInteraction);
}

