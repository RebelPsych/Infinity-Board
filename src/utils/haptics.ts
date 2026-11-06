export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' = 'light', enabled = true) {
  if (!enabled || typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(24);
        break;
      case 'heavy':
        navigator.vibrate([35, 20, 35]);
        break;
      case 'selection':
        navigator.vibrate(18);
        break;
    }
  } catch {
    // Vibration blocked or unsupported
  }
}
