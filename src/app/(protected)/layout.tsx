'use client';

import { useAuth } from '@/components/layout/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasResetToken = Boolean(searchParams?.get('reset'));
  const allowUnauthed = pathname === '/account' && hasResetToken;
  const showSpinner = useSmoothLoading(isLoading || (!isAuthenticated && !allowUnauthed), 120, 220);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !allowUnauthed) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, allowUnauthed, router]);

  if (showSpinner) {
    return <FullscreenSpinner />;
  }

  return <>{children}</>;
}
