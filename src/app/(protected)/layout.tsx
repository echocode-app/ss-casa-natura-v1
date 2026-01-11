'use client';

import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const showSpinner = useSmoothLoading(isLoading || !isAuthenticated, 120, 220);

  useEffect(() => {
    // Чекаємо завантаження auth стану
    if (isLoading) return;

    // Якщо не залогінений - перенаправляємо на головну
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Показуємо loading поки перевіряємо аутентифікацію
  if (showSpinner) {
    return <FullscreenSpinner />;
  }

  return <>{children}</>;
}
