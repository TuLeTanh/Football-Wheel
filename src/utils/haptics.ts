// Thin wrapper so the rest of the app never has to know whether it's
// running as a PWA (Vibration API) or a native Capacitor build (Haptics).
type HapticStyle = 'light' | 'medium' | 'soft' | 'selection';

async function tryCapacitorHaptics(style: HapticStyle): Promise<boolean> {
  try {
    const cap = (window as any).Capacitor;
    if (!cap?.isNativePlatform?.()) return false;
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    if (style === 'selection') {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } else {
      const map: Record<string, any> = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        soft: ImpactStyle.Light
      };
      await Haptics.impact({ style: map[style] });
    }
    return true;
  } catch {
    return false;
  }
}

function vibrateFallback(style: HapticStyle) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const pattern: Record<HapticStyle, number | number[]> = {
    light: 10,
    selection: 8,
    soft: 12,
    medium: [15, 30, 15]
  };
  navigator.vibrate(pattern[style]);
}

export async function haptic(style: HapticStyle = 'light'): Promise<void> {
  const handled = await tryCapacitorHaptics(style);
  if (!handled) vibrateFallback(style);
}
