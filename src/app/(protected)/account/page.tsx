'use client';

import { useAuth } from '@/components/layout/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import AccountLayout from '@/components/layout/User/AccountLayout';
import ProfileSection from '@/components/account/ProfileSection';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';
import ResetPasswordForm from '@/components/account/ResetPasswordForm';

import { User } from '@/types/user';

export default function AccountPage() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams?.get('reset') || '';

  const showSpinner = useSmoothLoading(isLoading || (!isAuthenticated && !resetToken), 120, 220);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !resetToken) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, resetToken, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (showSpinner || (!user && !resetToken)) {
    return <FullscreenSpinner />;
  }

  if (resetToken) {
    return (
      <AccountLayout allowUnauthed>
        <ResetPasswordForm token={resetToken} />
      </AccountLayout>
    );
  }

  if (!user) {
    return <FullscreenSpinner />;
  }

  // Convert user to User type for components
  const userProfile: User = {
    id: user.id,
    email: user.email,
    nome: user.name || '',
    cognome: user.surname || '',
    phone: user.phone,
    deliveryAddress: user.deliveryAddress,
    role: user.role,
  };

  return (
    <AccountLayout>
      <ProfileSection user={userProfile} onLogout={handleLogout} />
    </AccountLayout>
  );
}
