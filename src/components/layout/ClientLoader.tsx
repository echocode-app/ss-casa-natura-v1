'use client';

import { useState, useEffect } from 'react';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';

export default function ClientLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <FullscreenSpinner />;

  return <>{children}</>;
}
