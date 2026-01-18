'use client';

import { useEffect } from 'react';

export default function CsrfBootstrap() {
  useEffect(() => {
    // Prime csrf-token cookie early so first POSTs can attach x-csrf-token.
    void fetch('/api/csrf', { method: 'GET', credentials: 'include' }).catch(() => {
      // no-op
    });
  }, []);

  return null;
}
