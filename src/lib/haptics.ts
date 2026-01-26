/**
 * Haptic feedback utility for native-like touch interactions
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const hapticPatterns: Record<HapticType, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30, 10, 30],
  success: [10, 50, 20],
  warning: [20, 50, 20, 50, 20],
  error: [50, 50, 50],
  selection: [5],
};

/**
 * Trigger haptic feedback on supported devices
 * Falls back silently on unsupported devices
 */
export const haptic = (type: HapticType = 'light'): void => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(hapticPatterns[type]);
    } catch {
      // Silently fail on unsupported devices
    }
  }
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Hook-style haptic triggers for common actions
 */
export const haptics = {
  tap: () => haptic('light'),
  press: () => haptic('medium'),
  longPress: () => haptic('heavy'),
  success: () => haptic('success'),
  warning: () => haptic('warning'),
  error: () => haptic('error'),
  selection: () => haptic('selection'),
};
