/**
 * Haptic & Tactile Feedback Service
 * Works natively on Capacitor Android / iOS and falls back to Web Vibration API.
 */

export const triggerHaptic = {
  /** Light click feedback for keypad or tab buttons */
  light: () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {}
  },

  /** Medium feedback for correct answers or successful actions */
  success: () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([15, 50, 20]);
      }
    } catch {}
  },

  /** Warning vibration for mistake or anti-cheat detection */
  warning: () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 40, 60]);
      }
    } catch {}
  },

  /** Strong alert for time expired or column switch */
  alarm: () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 50, 80, 50, 100]);
      }
    } catch {}
  },
};
