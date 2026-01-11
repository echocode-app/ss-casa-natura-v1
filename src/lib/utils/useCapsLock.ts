import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect CapsLock state
 * Returns capsLockOn state and handler for input events
 */
export function useCapsLockDetector() {
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleKeyEvent = useCallback((event: KeyboardEvent) => {
    if (event.getModifierState) {
      setCapsLockOn(event.getModifierState('CapsLock'));
    }
  }, []);

  useEffect(() => {
    // Listen to keydown and keyup events globally
    window.addEventListener('keydown', handleKeyEvent);
    window.addEventListener('keyup', handleKeyEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
      window.removeEventListener('keyup', handleKeyEvent);
    };
  }, [handleKeyEvent]);

  return { capsLockOn, handleKeyEvent };
}
