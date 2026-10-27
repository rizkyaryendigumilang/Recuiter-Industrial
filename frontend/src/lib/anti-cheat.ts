import { useState, useEffect, useCallback, useRef } from 'react';
import { triggerHaptic } from './haptics';

export interface AntiCheatOptions {
  enabled?: boolean;
  maxWarnings?: number;
  onViolation?: (warningCount: number, reason: string) => void;
  onExceeded?: () => void;
}

export function useAntiCheat({
  enabled = true,
  maxWarnings = 3,
  onViolation,
  onExceeded,
}: AntiCheatOptions = {}) {
  const [warnings, setWarnings] = useState<number>(0);
  const [lastViolationReason, setLastViolationReason] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const warningsRef = useRef<number>(0);
  warningsRef.current = warnings;

  const handleViolation = useCallback(
    (reason: string) => {
      if (!enabled) return;

      const nextWarnings = warningsRef.current + 1;
      setWarnings(nextWarnings);
      setLastViolationReason(reason);
      setShowWarningModal(true);
      triggerHaptic.warning();

      if (onViolation) {
        onViolation(nextWarnings, reason);
      }

      if (nextWarnings >= maxWarnings && onExceeded) {
        onExceeded();
      }
    },
    [enabled, maxWarnings, onViolation, onExceeded]
  );

  const requestFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {}
  }, []);

  const dismissWarningModal = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 1. Detect tab switching / minimizing
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation('Peralihan tab browser terdeteksi');
      }
    };

    // 2. Detect window blur (switching apps or clicking outside browser)
    const handleBlur = () => {
      handleViolation('Fokus jendela browser hilang (Alt-Tab atau aplikasi lain)');
    };

    // 3. Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 4. Prevent DevTools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 or Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        handleViolation('Upaya membuka developer tools / source code dicegah');
      }
    };

    // 5. Track fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [enabled, handleViolation]);

  return {
    warnings,
    maxWarnings,
    lastViolationReason,
    showWarningModal,
    dismissWarningModal,
    isFullscreen,
    requestFullscreen,
    isExceeded: warnings >= maxWarnings,
  };
}
