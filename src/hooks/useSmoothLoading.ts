'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Delays showing a loader to avoid flicker and keeps it visible briefly once shown.
 */
export function useSmoothLoading(isLoading: boolean, delayMs = 120, minVisibleMs = 250) {
  const [show, setShow] = useState(isLoading);
  const startRef = useRef<number | null>(isLoading ? performance.now() : null);

  useEffect(() => {
    let delayTimeout: ReturnType<typeof setTimeout> | undefined;
    let minTimeout: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      if (show) {
        if (!startRef.current) startRef.current = performance.now();
      } else {
        delayTimeout = setTimeout(() => {
          startRef.current = performance.now();
          setShow(true);
        }, delayMs);
      }
    } else {
      if (!show) return () => undefined;

      const elapsed = startRef.current ? performance.now() - startRef.current : 0;
      const remaining = Math.max(minVisibleMs - elapsed, 0);

      minTimeout = setTimeout(() => {
        setShow(false);
        startRef.current = null;
      }, remaining);
    }

    return () => {
      if (delayTimeout) clearTimeout(delayTimeout);
      if (minTimeout) clearTimeout(minTimeout);
    };
  }, [isLoading, delayMs, minVisibleMs, show]);

  return show;
}
