import { useSettingsStore } from '@/stores/useSettingsStore';

type SoundName = 'spin' | 'winner' | 'click' | 'lock';

const cache = new Map<SoundName, HTMLAudioElement>();

/**
 * PRD 3.24 – Sound System: "Version 1 không có dữ liệu, nhưng thiết kế sẵn."
 * v1 intentionally ships with zero audio assets — this module is the ready
 * architecture so a future release can drop spin.mp3 / winner.mp3 /
 * click.mp3 / lock.mp3 into /assets/sounds/ without touching call sites.
 *
 * FR-019 – "Nếu Sound OFF -> Không load Sound": when the Settings toggle is
 * off we never even construct an Audio element, let alone fetch a file.
 */
export function playSound(name: SoundName): void {
  if (!useSettingsStore.getState().soundEnabled) return;

  let audio = cache.get(name);
  if (!audio) {
    audio = new Audio(`/assets/sounds/${name}.mp3`);
    cache.set(name, audio);
  }
  audio.currentTime = 0;
  audio.play().catch(() => {
    // No assets ship in v1 (404 expected) — fail silently rather than surface
    // a console error for a feature that isn't wired up yet.
  });
}
